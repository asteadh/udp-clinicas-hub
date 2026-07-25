package auth

import (
	"context"
	"encoding/json"
	"errors"
	"strings"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

// Service implements sign-in for Hub Negocios UDP. Unlike Gremia there is no
// public email/password registration: accounts are created either by Google
// OAuth sign-in, by a passkey ceremony against an already-known email, or by
// cmd/seed for the break-glass superadmin. Login(email, password) exists only
// for that break-glass account.
type Service struct {
	jwtSecret string
	pool      *pgxpool.Pool
	tokenTTL  time.Duration
}

type Session struct {
	AccessToken string         `json:"accessToken"`
	TokenType   string         `json:"tokenType"`
	User        map[string]any `json:"user"`
}

const defaultTokenTTL = 12 * time.Hour

func NewService(pool *pgxpool.Pool, jwtSecret string) *Service {
	return &Service{pool: pool, jwtSecret: jwtSecret, tokenTTL: defaultTokenTTL}
}

func (s *Service) Login(ctx context.Context, email string, password string) (Session, error) {
	email = strings.ToLower(strings.TrimSpace(email))
	var userID string
	var hash string
	err := s.pool.QueryRow(ctx, `SELECT id, password_hash FROM app_users WHERE lower(email) = $1 AND deleted_at IS NULL`, email).Scan(&userID, &hash)
	if err != nil {
		return Session{}, errors.New("invalid credentials")
	}
	if !VerifyPassword(hash, password) {
		return Session{}, errors.New("invalid credentials")
	}
	return s.sessionForUser(ctx, userID)
}

// OAuth resolves or creates the app_user for a verified provider profile and
// mints a session. Accounts are matched first by existing provider identity,
// then by email, otherwise a new user is created.
func (s *Service) OAuth(ctx context.Context, provider string, providerUserID string, email string, firstName string, lastName string, imageURL string) (Session, error) {
	provider = strings.ToLower(strings.TrimSpace(provider))
	providerUserID = strings.TrimSpace(providerUserID)
	email = strings.ToLower(strings.TrimSpace(email))
	if provider == "" || providerUserID == "" {
		return Session{}, errors.New("provider and provider user id are required")
	}

	var userID string
	err := s.pool.QueryRow(ctx, `SELECT user_id FROM oauth_identities WHERE provider = $1 AND provider_user_id = $2`, provider, providerUserID).Scan(&userID)
	if errors.Is(err, pgx.ErrNoRows) {
		if email != "" {
			err = s.pool.QueryRow(ctx, `SELECT id FROM app_users WHERE lower(email) = $1 AND deleted_at IS NULL`, email).Scan(&userID)
		}
		if errors.Is(err, pgx.ErrNoRows) || userID == "" {
			var idErr error
			userID, idErr = NewID("usr")
			if idErr != nil {
				return Session{}, idErr
			}
			_, err = s.pool.Exec(ctx, `
INSERT INTO app_users (id, uid, email, first_name, last_name, image_url, status, suspended, inactive, email_verified)
VALUES ($1, $1, $2, $3, $4, $5, 'active', false, false, true)`,
				userID, nullable(email), nullable(firstName), nullable(lastName), nullable(imageURL))
			if err != nil {
				return Session{}, err
			}
		} else if err != nil {
			return Session{}, err
		}
		_, err = s.pool.Exec(ctx, `
INSERT INTO oauth_identities (provider, provider_user_id, user_id, email)
VALUES ($1, $2, $3, $4)
ON CONFLICT (provider, provider_user_id) DO UPDATE SET user_id = EXCLUDED.user_id, email = EXCLUDED.email`,
			provider, providerUserID, userID, nullable(email))
		if err != nil {
			return Session{}, err
		}
	} else if err != nil {
		return Session{}, err
	}
	return s.sessionForUser(ctx, userID)
}

func (s *Service) UserFromBearer(ctx context.Context, authorization string) (map[string]any, error) {
	token := strings.TrimSpace(strings.TrimPrefix(authorization, "Bearer "))
	if token == "" {
		return nil, errors.New("missing bearer token")
	}
	claims, err := VerifyToken(s.jwtSecret, token)
	if err != nil {
		return nil, err
	}
	return s.userByID(ctx, claims.Subject)
}

func (s *Service) sessionForUser(ctx context.Context, userID string) (Session, error) {
	user, err := s.userByID(ctx, userID)
	if err != nil {
		return Session{}, err
	}
	claims := Claims{
		Email:     stringValue(user["email"]),
		ExpiresAt: time.Now().Add(s.tokenTTL).Unix(),
		Subject:   userID,
	}
	token, err := SignToken(s.jwtSecret, claims)
	if err != nil {
		return Session{}, err
	}
	return Session{AccessToken: token, TokenType: "Bearer", User: user}, nil
}

func (s *Service) userByID(ctx context.Context, userID string) (map[string]any, error) {
	var raw []byte
	err := s.pool.QueryRow(ctx, `
SELECT jsonb_build_object(
  'uid', uid,
  'id', id,
  'createdAt', created_at,
  'email', email,
  'emailVerified', email_verified,
  'firstName', first_name,
  'lastName', last_name,
  'imageUrl', image_url,
  'status', status,
  'suspended', suspended,
  'inactive', inactive
) FROM app_users WHERE id = $1 AND deleted_at IS NULL`, userID).Scan(&raw)
	if err != nil {
		return nil, err
	}
	var user map[string]any
	return user, json.Unmarshal(raw, &user)
}

func nullable(value string) any {
	if strings.TrimSpace(value) == "" {
		return nil
	}
	return strings.TrimSpace(value)
}

func stringValue(value any) string {
	if value == nil {
		return ""
	}
	if text, ok := value.(string); ok {
		return text
	}
	return ""
}
