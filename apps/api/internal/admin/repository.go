package admin

import (
	"context"
	"encoding/json"
	"errors"
	"strings"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Repository struct {
	pool *pgxpool.Pool
}

func NewRepository(pool *pgxpool.Pool) *Repository {
	return &Repository{pool: pool}
}

var errForbidden = errors.New("admin access required")

// UpsertSuperadmin grants the RoleSuperadmin (full access, no clinic scope)
// to userID. Called automatically the first time an account whose email
// matches the configured bootstrap list or admin email domain authenticates.
func (r *Repository) UpsertSuperadmin(ctx context.Context, userID string) error {
	_, err := r.pool.Exec(ctx, `
INSERT INTO admin_roles (user_id, role, clinic_slug, permissions)
VALUES ($1, 'superadmin', NULL, ARRAY['*'])
ON CONFLICT (user_id) DO UPDATE SET role = 'superadmin', clinic_slug = NULL, permissions = ARRAY['*'], updated_at = now()`,
		userID)
	return err
}

// FindPrincipalByEmail resolves the admin_roles row for an already-known
// (userID, email) pair. Returns errForbidden if the user has no admin role.
func (r *Repository) FindPrincipalByEmail(ctx context.Context, userID string, email string) (Principal, error) {
	if userID == "" {
		return Principal{}, errForbidden
	}
	var principal Principal
	var clinicSlug *string
	err := r.pool.QueryRow(ctx, `
SELECT ar.user_id, coalesce(u.email, ''), ar.role, ar.clinic_slug, ar.permissions
FROM admin_roles ar
JOIN app_users u ON u.id = ar.user_id
WHERE ar.user_id = $1 AND u.deleted_at IS NULL AND u.suspended = false AND u.inactive = false`,
		userID).Scan(&principal.UserID, &principal.Email, &principal.Role, &clinicSlug, &principal.Permissions)
	if errors.Is(err, pgx.ErrNoRows) {
		return Principal{}, errForbidden
	}
	if err != nil {
		return Principal{}, err
	}
	if clinicSlug != nil {
		principal.ClinicSlug = *clinicSlug
	}
	_ = email
	return principal, nil
}

func (r *Repository) InsertAuditLog(ctx context.Context, actorID string, action string, targetType string, targetID string, metadata map[string]any) error {
	if metadata == nil {
		metadata = map[string]any{}
	}
	raw, err := json.Marshal(metadata)
	if err != nil {
		return err
	}
	_, err = r.pool.Exec(ctx, `
INSERT INTO admin_audit_logs (actor_id, action, target_type, target_id, metadata)
VALUES (nullif($1, ''), $2, $3, nullif($4, ''), $5)`,
		actorID, action, targetType, targetID, raw)
	return err
}

func (r *Repository) AuditLogs(ctx context.Context) ([]map[string]any, error) {
	return r.listJSON(ctx, `
SELECT jsonb_build_object(
  'id', l.id,
  'actorId', l.actor_id,
  'actorEmail', au.email,
  'action', l.action,
  'targetType', l.target_type,
  'targetId', l.target_id,
  'metadata', l.metadata,
  'createdAt', l.created_at
)
FROM admin_audit_logs l
LEFT JOIN app_users au ON au.id = l.actor_id
ORDER BY l.created_at DESC
LIMIT 250`)
}

func (r *Repository) listJSON(ctx context.Context, query string, args ...any) ([]map[string]any, error) {
	rows, err := r.pool.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	values := []map[string]any{}
	for rows.Next() {
		var raw []byte
		if err := rows.Scan(&raw); err != nil {
			return nil, err
		}
		var value map[string]any
		if err := json.Unmarshal(raw, &value); err != nil {
			return nil, err
		}
		values = append(values, value)
	}
	return values, rows.Err()
}

func (r *Repository) oneJSON(ctx context.Context, query string, args ...any) (map[string]any, error) {
	var raw []byte
	err := r.pool.QueryRow(ctx, query, args...).Scan(&raw)
	if err != nil {
		return nil, err
	}
	value := map[string]any{}
	return value, json.Unmarshal(raw, &value)
}

func normalizeEmail(email string) string {
	return strings.ToLower(strings.TrimSpace(email))
}
