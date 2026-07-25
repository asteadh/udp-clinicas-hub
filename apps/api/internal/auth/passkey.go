package auth

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"errors"
	"strings"

	"github.com/go-webauthn/webauthn/protocol"
	"github.com/go-webauthn/webauthn/webauthn"
	"github.com/jackc/pgx/v5/pgxpool"

	"hubnegocios/backend/internal/config"
)

// PasskeyService drives the WebAuthn registration and login ceremonies and
// mints the same JWT session the rest of auth uses once a passkey checks out.
type PasskeyService struct {
	auth *Service
	pool *pgxpool.Pool
	wa   *webauthn.WebAuthn
}

func NewPasskeyService(authSvc *Service, pool *pgxpool.Pool, cfg *config.Config) (*PasskeyService, error) {
	wa, err := webauthn.New(&webauthn.Config{
		RPID:          cfg.WebAuthnRPID,
		RPDisplayName: cfg.WebAuthnRPName,
		RPOrigins:     cfg.WebAuthnRPOrigins,
	})
	if err != nil {
		return nil, err
	}
	return &PasskeyService{auth: authSvc, pool: pool, wa: wa}, nil
}

// waUser adapts an app_users row to the webauthn.User interface.
type waUser struct {
	id          []byte
	name        string
	displayName string
	creds       []webauthn.Credential
}

func (u *waUser) WebAuthnID() []byte                         { return u.id }
func (u *waUser) WebAuthnName() string                       { return u.name }
func (u *waUser) WebAuthnDisplayName() string                { return u.displayName }
func (u *waUser) WebAuthnCredentials() []webauthn.Credential { return u.creds }

// BeginRegistration issues creation options for the authenticated user.
func (p *PasskeyService) BeginRegistration(ctx context.Context, userID string) (map[string]any, error) {
	user, err := p.loadUser(ctx, userID)
	if err != nil {
		return nil, err
	}
	exclusions := make([]protocol.CredentialDescriptor, 0, len(user.creds))
	for _, c := range user.creds {
		exclusions = append(exclusions, c.Descriptor())
	}
	creation, session, err := p.wa.BeginRegistration(
		user,
		webauthn.WithExclusions(exclusions),
		// Request a discoverable (resident) credential so usernameless one-tap
		// login works: navigator.credentials.get() with an empty allowCredentials
		// can only find the passkey if it was created as discoverable.
		webauthn.WithResidentKeyRequirement(protocol.ResidentKeyRequirementPreferred),
	)
	if err != nil {
		return nil, err
	}
	sessionID, err := p.storeSession(ctx, "register", userID, session)
	if err != nil {
		return nil, err
	}
	return map[string]any{"sessionId": sessionID, "options": creation}, nil
}

// FinishRegistration verifies the attestation and stores the credential.
func (p *PasskeyService) FinishRegistration(ctx context.Context, userID, sessionID string, response json.RawMessage, label string) error {
	sessionUser, session, err := p.takeSession(ctx, sessionID, "register")
	if err != nil {
		return err
	}
	if sessionUser != userID {
		return errors.New("challenge does not belong to this user")
	}
	user, err := p.loadUser(ctx, userID)
	if err != nil {
		return err
	}
	parsed, err := protocol.ParseCredentialCreationResponseBody(strings.NewReader(string(response)))
	if err != nil {
		return err
	}
	credential, err := p.wa.CreateCredential(user, session, parsed)
	if err != nil {
		return err
	}
	return p.storeCredential(ctx, userID, credential, label)
}

// BeginLogin issues assertion options for the passkeys registered to an email.
func (p *PasskeyService) BeginLogin(ctx context.Context, email string) (map[string]any, error) {
	userID, err := p.userIDByEmail(ctx, email)
	if err != nil {
		return nil, errors.New("no passkey found for this account")
	}
	user, err := p.loadUser(ctx, userID)
	if err != nil {
		return nil, err
	}
	if len(user.creds) == 0 {
		return nil, errors.New("no passkey found for this account")
	}
	assertion, session, err := p.wa.BeginLogin(user)
	if err != nil {
		return nil, err
	}
	sessionID, err := p.storeSession(ctx, "login", userID, session)
	if err != nil {
		return nil, err
	}
	return map[string]any{"sessionId": sessionID, "options": assertion}, nil
}

// BeginDiscoverableLogin issues assertion options for a usernameless (one-tap)
// passkey sign-in — the authenticator offers whatever credentials it holds for
// this relying party and the user is resolved from the assertion.
func (p *PasskeyService) BeginDiscoverableLogin(ctx context.Context) (map[string]any, error) {
	assertion, session, err := p.wa.BeginDiscoverableLogin()
	if err != nil {
		return nil, err
	}
	sessionID, err := p.storeSession(ctx, "login", "", session)
	if err != nil {
		return nil, err
	}
	return map[string]any{"sessionId": sessionID, "options": assertion}, nil
}

// FinishLogin verifies the assertion and returns a signed session. It handles
// both email-scoped and discoverable (usernameless) sessions.
func (p *PasskeyService) FinishLogin(ctx context.Context, sessionID string, response json.RawMessage) (Session, error) {
	userID, session, err := p.takeSession(ctx, sessionID, "login")
	if err != nil {
		return Session{}, err
	}
	parsed, err := protocol.ParseCredentialRequestResponseBody(strings.NewReader(string(response)))
	if err != nil {
		return Session{}, err
	}

	var credential *webauthn.Credential
	if userID == "" {
		// Discoverable login: resolve the user from the credential's user handle
		// (which is the app user id), falling back to a credential-id lookup.
		credential, err = p.wa.ValidateDiscoverableLogin(func(rawID, userHandle []byte) (webauthn.User, error) {
			uid := strings.TrimSpace(string(userHandle))
			if uid == "" {
				credID := base64.RawURLEncoding.EncodeToString(rawID)
				if e := p.pool.QueryRow(ctx,
					`SELECT user_id FROM webauthn_credentials WHERE credential_id = $1`, credID).Scan(&uid); e != nil {
					return nil, e
				}
			}
			userID = uid
			return p.loadUser(ctx, uid)
		}, session, parsed)
	} else {
		var user *waUser
		user, err = p.loadUser(ctx, userID)
		if err != nil {
			return Session{}, err
		}
		credential, err = p.wa.ValidateLogin(user, session, parsed)
	}
	if err != nil {
		return Session{}, err
	}
	if err := p.updateCredential(ctx, credential); err != nil {
		return Session{}, err
	}
	return p.auth.sessionForUser(ctx, userID)
}

// --- storage helpers ---

func (p *PasskeyService) loadUser(ctx context.Context, userID string) (*waUser, error) {
	var email, first, last *string
	err := p.pool.QueryRow(ctx,
		`SELECT email, first_name, last_name FROM app_users WHERE id = $1 AND deleted_at IS NULL`,
		userID).Scan(&email, &first, &last)
	if err != nil {
		return nil, errors.New("user not found")
	}
	creds, err := p.loadCreds(ctx, userID)
	if err != nil {
		return nil, err
	}
	name := deref(email)
	if name == "" {
		name = userID
	}
	display := strings.TrimSpace(deref(first) + " " + deref(last))
	if display == "" {
		display = name
	}
	return &waUser{id: []byte(userID), name: name, displayName: display, creds: creds}, nil
}

func (p *PasskeyService) userIDByEmail(ctx context.Context, email string) (string, error) {
	email = strings.ToLower(strings.TrimSpace(email))
	var userID string
	err := p.pool.QueryRow(ctx,
		`SELECT id FROM app_users WHERE lower(email) = $1 AND deleted_at IS NULL`, email).Scan(&userID)
	return userID, err
}

func (p *PasskeyService) loadCreds(ctx context.Context, userID string) ([]webauthn.Credential, error) {
	rows, err := p.pool.Query(ctx, `SELECT data FROM webauthn_credentials WHERE user_id = $1`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var creds []webauthn.Credential
	for rows.Next() {
		var raw []byte
		if err := rows.Scan(&raw); err != nil {
			return nil, err
		}
		var c webauthn.Credential
		if err := json.Unmarshal(raw, &c); err != nil {
			return nil, err
		}
		creds = append(creds, c)
	}
	return creds, rows.Err()
}

func (p *PasskeyService) storeCredential(ctx context.Context, userID string, cred *webauthn.Credential, label string) error {
	raw, err := json.Marshal(cred)
	if err != nil {
		return err
	}
	id, err := NewID("wac")
	if err != nil {
		return err
	}
	credID := base64.RawURLEncoding.EncodeToString(cred.ID)
	_, err = p.pool.Exec(ctx, `
INSERT INTO webauthn_credentials (id, user_id, credential_id, data, label)
VALUES ($1, $2, $3, $4, $5)
ON CONFLICT (credential_id) DO UPDATE SET data = EXCLUDED.data, label = EXCLUDED.label`,
		id, userID, credID, raw, strings.TrimSpace(label))
	return err
}

func (p *PasskeyService) updateCredential(ctx context.Context, cred *webauthn.Credential) error {
	raw, err := json.Marshal(cred)
	if err != nil {
		return err
	}
	credID := base64.RawURLEncoding.EncodeToString(cred.ID)
	_, err = p.pool.Exec(ctx,
		`UPDATE webauthn_credentials SET data = $2, last_used_at = now() WHERE credential_id = $1`,
		credID, raw)
	return err
}

func (p *PasskeyService) storeSession(ctx context.Context, purpose, userID string, session *webauthn.SessionData) (string, error) {
	raw, err := json.Marshal(session)
	if err != nil {
		return "", err
	}
	id, err := NewID("was")
	if err != nil {
		return "", err
	}
	_, err = p.pool.Exec(ctx,
		`INSERT INTO webauthn_sessions (id, user_id, purpose, data) VALUES ($1, $2, $3, $4)`,
		id, nullable(userID), purpose, raw)
	return id, err
}

// takeSession atomically consumes a single-use challenge session.
func (p *PasskeyService) takeSession(ctx context.Context, id, purpose string) (string, webauthn.SessionData, error) {
	var userID *string
	var raw []byte
	err := p.pool.QueryRow(ctx,
		`DELETE FROM webauthn_sessions WHERE id = $1 AND purpose = $2 AND expires_at > now() RETURNING user_id, data`,
		id, purpose).Scan(&userID, &raw)
	if err != nil {
		return "", webauthn.SessionData{}, errors.New("passkey challenge expired or not found")
	}
	var session webauthn.SessionData
	if err := json.Unmarshal(raw, &session); err != nil {
		return "", webauthn.SessionData{}, err
	}
	return deref(userID), session, nil
}

func deref(s *string) string {
	if s == nil {
		return ""
	}
	return *s
}
