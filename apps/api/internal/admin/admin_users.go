package admin

import (
	"context"
	"errors"
	"net/http"
	"strings"

	"github.com/jackc/pgx/v5"

	"hubnegocios/backend/internal/auth"
)

// AdminUsers manages clinic_admin / superadmin accounts. Superadmin-only:
// invited users sign in later via Google OAuth (matched by email) or a
// passkey ceremony started from their known email — there is no password
// step here.
func (r *Repository) AdminUsers(ctx context.Context) ([]map[string]any, error) {
	return r.listJSON(ctx, `
SELECT jsonb_build_object(
  'userId', ar.user_id,
  'email', u.email,
  'firstName', u.first_name,
  'lastName', u.last_name,
  'role', ar.role,
  'clinicSlug', ar.clinic_slug,
  'permissions', ar.permissions,
  'status', u.status,
  'createdAt', ar.created_at,
  'updatedAt', ar.updated_at
)
FROM admin_roles ar
JOIN app_users u ON u.id = ar.user_id
WHERE u.deleted_at IS NULL
ORDER BY ar.created_at DESC`)
}

var errAdminUserExists = errors.New("an admin user with this email already exists")

func (r *Repository) InviteAdminUser(ctx context.Context, email string, firstName string, lastName string, role string, clinicSlug string, permissions []string) (map[string]any, error) {
	email = normalizeEmail(email)
	if email == "" {
		return nil, errors.New("email is required")
	}
	role = strings.TrimSpace(role)
	if role != RoleSuperadmin && role != RoleClinicAdmin {
		return nil, errors.New("role must be superadmin or clinic_admin")
	}
	clinicSlug = strings.TrimSpace(clinicSlug)
	if role == RoleClinicAdmin && clinicSlug == "" {
		return nil, errors.New("clinicSlug is required for clinic_admin")
	}
	if role == RoleSuperadmin {
		clinicSlug = ""
	}

	var userID string
	err := r.pool.QueryRow(ctx, `SELECT id FROM app_users WHERE lower(email) = $1 AND deleted_at IS NULL`, email).Scan(&userID)
	if errors.Is(err, pgx.ErrNoRows) {
		newUserID, idErr := auth.NewID("usr")
		if idErr != nil {
			return nil, idErr
		}
		userID = newUserID
		_, err = r.pool.Exec(ctx, `
INSERT INTO app_users (id, uid, email, first_name, last_name, status)
VALUES ($1, $1, $2, $3, $4, 'invited')`,
			userID, email, nullableStr(firstName), nullableStr(lastName))
	}
	if err != nil {
		return nil, err
	}

	var existingRole string
	err = r.pool.QueryRow(ctx, `SELECT role FROM admin_roles WHERE user_id = $1`, userID).Scan(&existingRole)
	if err == nil {
		return nil, errAdminUserExists
	}
	if !errors.Is(err, pgx.ErrNoRows) && err != nil {
		return nil, err
	}

	_, err = r.pool.Exec(ctx, `
INSERT INTO admin_roles (user_id, role, clinic_slug, permissions)
VALUES ($1, $2, $3, $4)`,
		userID, role, nullableStr(clinicSlug), permissions)
	if err != nil {
		return nil, err
	}
	return r.oneJSON(ctx, `
SELECT jsonb_build_object('userId', ar.user_id, 'email', u.email, 'role', ar.role, 'clinicSlug', ar.clinic_slug, 'permissions', ar.permissions)
FROM admin_roles ar JOIN app_users u ON u.id = ar.user_id WHERE ar.user_id = $1`, userID)
}

func (r *Repository) UpdateAdminUser(ctx context.Context, userID string, role string, clinicSlug string, permissions []string) error {
	role = strings.TrimSpace(role)
	if role != RoleSuperadmin && role != RoleClinicAdmin {
		return errors.New("role must be superadmin or clinic_admin")
	}
	clinicSlug = strings.TrimSpace(clinicSlug)
	if role == RoleClinicAdmin && clinicSlug == "" {
		return errors.New("clinicSlug is required for clinic_admin")
	}
	if role == RoleSuperadmin {
		clinicSlug = ""
	}
	tag, err := r.pool.Exec(ctx, `
UPDATE admin_roles SET role = $2, clinic_slug = $3, permissions = $4, updated_at = now()
WHERE user_id = $1`, userID, role, nullableStr(clinicSlug), permissions)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return errors.New("admin user not found")
	}
	return nil
}

func (r *Repository) RemoveAdminUser(ctx context.Context, userID string) error {
	tag, err := r.pool.Exec(ctx, `DELETE FROM admin_roles WHERE user_id = $1`, userID)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return errors.New("admin user not found")
	}
	return nil
}

func nullableStr(value string) any {
	if strings.TrimSpace(value) == "" {
		return nil
	}
	return strings.TrimSpace(value)
}

// --- HTTP handlers (superadmin only) -------------------------------------

func (h *Handlers) adminUsers(w http.ResponseWriter, r *http.Request) {
	values, err := h.repo.AdminUsers(r.Context())
	if err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"adminUsers": values})
}

type inviteAdminUserRequest struct {
	Email       string   `json:"email"`
	FirstName   string   `json:"firstName"`
	LastName    string   `json:"lastName"`
	Role        string   `json:"role"`
	ClinicSlug  string   `json:"clinicSlug"`
	Permissions []string `json:"permissions"`
}

func (h *Handlers) createAdminUser(w http.ResponseWriter, r *http.Request) {
	var body inviteAdminUserRequest
	if err := readJSON(r, &body); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	value, err := h.repo.InviteAdminUser(r.Context(), body.Email, body.FirstName, body.LastName, body.Role, body.ClinicSlug, body.Permissions)
	if err != nil {
		status := http.StatusBadRequest
		if errors.Is(err, errAdminUserExists) {
			status = http.StatusConflict
		}
		writeError(w, status, err.Error())
		return
	}
	actor := principalFromContext(r)
	_ = h.repo.InsertAuditLog(r.Context(), actor.UserID, "admin_user.invite", "admin_user", stringValue(value["userId"]), map[string]any{"email": body.Email, "role": body.Role, "clinicSlug": body.ClinicSlug})
	writeJSON(w, http.StatusCreated, map[string]any{"adminUser": value})
}

type updateAdminUserRequest struct {
	Role        string   `json:"role"`
	ClinicSlug  string   `json:"clinicSlug"`
	Permissions []string `json:"permissions"`
}

func (h *Handlers) updateAdminUser(w http.ResponseWriter, r *http.Request) {
	var body updateAdminUserRequest
	if err := readJSON(r, &body); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	userID := r.PathValue("userId")
	if err := h.repo.UpdateAdminUser(r.Context(), userID, body.Role, body.ClinicSlug, body.Permissions); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	actor := principalFromContext(r)
	_ = h.repo.InsertAuditLog(r.Context(), actor.UserID, "admin_user.update", "admin_user", userID, map[string]any{"role": body.Role, "clinicSlug": body.ClinicSlug})
	writeJSON(w, http.StatusOK, map[string]any{"status": true})
}

func (h *Handlers) deleteAdminUser(w http.ResponseWriter, r *http.Request) {
	userID := r.PathValue("userId")
	if err := h.repo.RemoveAdminUser(r.Context(), userID); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	actor := principalFromContext(r)
	_ = h.repo.InsertAuditLog(r.Context(), actor.UserID, "admin_user.remove", "admin_user", userID, nil)
	writeJSON(w, http.StatusOK, map[string]any{"status": true})
}

// requireSuperadmin gate for admin-user management endpoints.
func (h *Handlers) requireSuperadmin(next http.HandlerFunc) http.HandlerFunc {
	return h.requireAdmin(func(w http.ResponseWriter, r *http.Request) {
		principal := principalFromContext(r)
		if principal.Role != RoleSuperadmin {
			writeError(w, http.StatusForbidden, "superadmin access required")
			return
		}
		next(w, r)
	})
}

