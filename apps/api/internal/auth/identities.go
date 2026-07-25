package auth

import (
	"context"
	"errors"
	"net/http"
	"strings"

	"hubnegocios/backend/internal/apiutil"
)

// Sign-in method management: accounts are keyed by email (Service.OAuth links
// same-email provider sign-ins automatically); these endpoints let a signed-in
// user see, link, and unlink providers and passkeys explicitly.

type identityRecord struct {
	Provider       string  `json:"provider"`
	ProviderUserID string  `json:"providerUserId"`
	Email          *string `json:"email"`
	CreatedAt      string  `json:"createdAt"`
}

type passkeyRecord struct {
	ID         string  `json:"id"`
	Label      string  `json:"label"`
	CreatedAt  string  `json:"createdAt"`
	LastUsedAt *string `json:"lastUsedAt"`
}

type identitiesResponse struct {
	Email       *string          `json:"email"`
	HasPassword bool             `json:"hasPassword"`
	Identities  []identityRecord `json:"identities"`
	Passkeys    []passkeyRecord  `json:"passkeys"`
}

func (s *Service) Identities(ctx context.Context, userID string) (identitiesResponse, error) {
	response := identitiesResponse{Identities: []identityRecord{}, Passkeys: []passkeyRecord{}}

	var hash *string
	err := s.pool.QueryRow(ctx, `SELECT email, password_hash FROM app_users WHERE id = $1 AND deleted_at IS NULL`, userID).
		Scan(&response.Email, &hash)
	if err != nil {
		return response, err
	}
	response.HasPassword = hash != nil && *hash != ""

	rows, err := s.pool.Query(ctx, `
SELECT provider, provider_user_id, email, to_char(created_at, 'YYYY-MM-DD"T"HH24:MI:SS"Z"')
FROM oauth_identities WHERE user_id = $1 ORDER BY created_at`, userID)
	if err != nil {
		return response, err
	}
	defer rows.Close()
	for rows.Next() {
		var record identityRecord
		if err := rows.Scan(&record.Provider, &record.ProviderUserID, &record.Email, &record.CreatedAt); err != nil {
			return response, err
		}
		response.Identities = append(response.Identities, record)
	}
	if err := rows.Err(); err != nil {
		return response, err
	}

	keyRows, err := s.pool.Query(ctx, `
SELECT id, label, to_char(created_at, 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
       to_char(last_used_at, 'YYYY-MM-DD"T"HH24:MI:SS"Z"')
FROM webauthn_credentials WHERE user_id = $1 ORDER BY created_at`, userID)
	if err != nil {
		return response, err
	}
	defer keyRows.Close()
	for keyRows.Next() {
		var record passkeyRecord
		if err := keyRows.Scan(&record.ID, &record.Label, &record.CreatedAt, &record.LastUsedAt); err != nil {
			return response, err
		}
		response.Passkeys = append(response.Passkeys, record)
	}
	return response, keyRows.Err()
}

var errIdentityTaken = errors.New("this sign in is already linked to another account")

// LinkOAuth binds a verified provider identity to the CURRENT user, regardless
// of the provider email. Refuses to steal an identity another account uses.
func (s *Service) LinkOAuth(ctx context.Context, userID string, provider string, providerUserID string, email string) error {
	provider = strings.ToLower(strings.TrimSpace(provider))
	providerUserID = strings.TrimSpace(providerUserID)
	if provider == "" || providerUserID == "" {
		return errors.New("provider and provider user id are required")
	}
	var existingUser string
	err := s.pool.QueryRow(ctx, `SELECT user_id FROM oauth_identities WHERE provider = $1 AND provider_user_id = $2`,
		provider, providerUserID).Scan(&existingUser)
	if err == nil && existingUser != userID {
		return errIdentityTaken
	}
	_, err = s.pool.Exec(ctx, `
INSERT INTO oauth_identities (provider, provider_user_id, user_id, email)
VALUES ($1, $2, $3, $4)
ON CONFLICT (provider, provider_user_id) DO UPDATE SET user_id = EXCLUDED.user_id, email = EXCLUDED.email`,
		provider, providerUserID, userID, nullable(strings.ToLower(strings.TrimSpace(email))))
	return err
}

var errLastSignInMethod = errors.New("cannot remove the last sign in method for this account")

// signInMethods counts ways the account can still authenticate.
func (s *Service) signInMethods(ctx context.Context, userID string) (int, error) {
	var count int
	err := s.pool.QueryRow(ctx, `
SELECT (SELECT CASE WHEN password_hash IS NOT NULL AND password_hash <> '' THEN 1 ELSE 0 END
        FROM app_users WHERE id = $1)
     + (SELECT count(*) FROM oauth_identities WHERE user_id = $1)
     + (SELECT count(*) FROM webauthn_credentials WHERE user_id = $1)`, userID).Scan(&count)
	return count, err
}

func (s *Service) UnlinkOAuth(ctx context.Context, userID string, provider string, providerUserID string) error {
	methods, err := s.signInMethods(ctx, userID)
	if err != nil {
		return err
	}
	if methods <= 1 {
		return errLastSignInMethod
	}
	tag, err := s.pool.Exec(ctx, `DELETE FROM oauth_identities WHERE user_id = $1 AND provider = $2 AND provider_user_id = $3`,
		userID, strings.ToLower(strings.TrimSpace(provider)), strings.TrimSpace(providerUserID))
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return errors.New("identity not found")
	}
	return nil
}

func (s *Service) DeletePasskey(ctx context.Context, userID string, id string) error {
	methods, err := s.signInMethods(ctx, userID)
	if err != nil {
		return err
	}
	if methods <= 1 {
		return errLastSignInMethod
	}
	tag, err := s.pool.Exec(ctx, `DELETE FROM webauthn_credentials WHERE user_id = $1 AND id = $2`, userID, id)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return errors.New("passkey not found")
	}
	return nil
}

// --- HTTP handlers -------------------------------------------------------

func (h *Handlers) bearerUserID(r *http.Request) (string, bool) {
	user, err := h.service.UserFromBearer(r.Context(), r.Header.Get("Authorization"))
	if err != nil {
		return "", false
	}
	id, _ := user["id"].(string)
	return id, id != ""
}

func (h *Handlers) identities(w http.ResponseWriter, r *http.Request) {
	userID, ok := h.bearerUserID(r)
	if !ok {
		apiutil.WriteError(w, http.StatusUnauthorized, "authentication required")
		return
	}
	response, err := h.service.Identities(r.Context(), userID)
	if err != nil {
		apiutil.WriteError(w, http.StatusBadRequest, err.Error())
		return
	}
	apiutil.WriteJSON(w, http.StatusOK, response)
}

func (h *Handlers) oauthLink(provider string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID, ok := h.bearerUserID(r)
		if !ok {
			apiutil.WriteError(w, http.StatusUnauthorized, "authentication required")
			return
		}
		var body oauthRequest
		if err := apiutil.ReadJSON(r, &body); err != nil {
			apiutil.WriteCodedError(w, r, http.StatusBadRequest, "invalid-request", err.Error())
			return
		}
		profile := OAuthProfile{
			Email:          body.Email,
			FirstName:      body.FirstName,
			ImageURL:       body.ImageURL,
			LastName:       body.LastName,
			ProviderUserID: body.ProviderUserID,
		}
		var err error
		if h.verifier != nil {
			profile, err = h.verifier.VerifyOAuth(r.Context(), provider, body)
			if err != nil {
				apiutil.WriteCodedError(w, r, http.StatusUnauthorized, oauthErrorCode(err), err.Error())
				return
			}
		}
		if err := h.service.LinkOAuth(r.Context(), userID, provider, profile.ProviderUserID, profile.Email); err != nil {
			status := http.StatusBadRequest
			if errors.Is(err, errIdentityTaken) {
				status = http.StatusConflict
			}
			apiutil.WriteError(w, status, err.Error())
			return
		}
		response, err := h.service.Identities(r.Context(), userID)
		if err != nil {
			apiutil.WriteError(w, http.StatusBadRequest, err.Error())
			return
		}
		apiutil.WriteJSON(w, http.StatusOK, response)
	}
}

func (h *Handlers) unlinkIdentity(w http.ResponseWriter, r *http.Request) {
	userID, ok := h.bearerUserID(r)
	if !ok {
		apiutil.WriteError(w, http.StatusUnauthorized, "authentication required")
		return
	}
	err := h.service.UnlinkOAuth(r.Context(), userID, r.PathValue("provider"), r.PathValue("providerUserId"))
	if err != nil {
		status := http.StatusBadRequest
		if errors.Is(err, errLastSignInMethod) {
			status = http.StatusConflict
		}
		apiutil.WriteError(w, status, err.Error())
		return
	}
	apiutil.WriteJSON(w, http.StatusOK, map[string]any{"status": "ok"})
}

func (h *Handlers) deletePasskey(w http.ResponseWriter, r *http.Request) {
	userID, ok := h.bearerUserID(r)
	if !ok {
		apiutil.WriteError(w, http.StatusUnauthorized, "authentication required")
		return
	}
	if err := h.service.DeletePasskey(r.Context(), userID, r.PathValue("id")); err != nil {
		status := http.StatusBadRequest
		if errors.Is(err, errLastSignInMethod) {
			status = http.StatusConflict
		}
		apiutil.WriteError(w, status, err.Error())
		return
	}
	apiutil.WriteJSON(w, http.StatusOK, map[string]any{"status": "ok"})
}
