package admin

import (
	"context"
	"net/http"
	"strings"
)

type AuthService interface {
	UserFromBearer(ctx context.Context, authorization string) (map[string]any, error)
}

type contextKey string

const principalContextKey contextKey = "adminPrincipal"

func parseEmailSet(raw []string) map[string]bool {
	emails := map[string]bool{}
	for _, value := range raw {
		for _, part := range strings.Split(value, ",") {
			email := strings.ToLower(strings.TrimSpace(part))
			if email != "" {
				emails[email] = true
			}
		}
	}
	return emails
}

// parseDomainSet normalizes an allow-list of email domains (e.g. "udp.cl")
// whose accounts are automatically granted superadmin access.
func parseDomainSet(raw []string) map[string]bool {
	domains := map[string]bool{}
	for _, value := range raw {
		for _, part := range strings.Split(value, ",") {
			domain := strings.ToLower(strings.TrimSpace(strings.TrimPrefix(strings.TrimSpace(part), "@")))
			if domain != "" {
				domains[domain] = true
			}
		}
	}
	return domains
}

func emailDomain(email string) string {
	email = strings.ToLower(strings.TrimSpace(email))
	if at := strings.LastIndex(email, "@"); at >= 0 && at < len(email)-1 {
		return email[at+1:]
	}
	return ""
}

func userString(user map[string]any, keys ...string) string {
	for _, key := range keys {
		if value, ok := user[key].(string); ok && strings.TrimSpace(value) != "" {
			return strings.TrimSpace(value)
		}
	}
	return ""
}

// PrincipalFromContext returns the admin Principal attached to the request
// context by requireAdmin. ok is false outside an admin-guarded handler.
func PrincipalFromContext(ctx context.Context) (Principal, bool) {
	principal, ok := ctx.Value(principalContextKey).(Principal)
	return principal, ok
}

func principalFromContext(r *http.Request) Principal {
	principal, _ := PrincipalFromContext(r.Context())
	return principal
}

// requireAdmin authenticates the bearer token and resolves an admin
// Principal. If the account's email matches a bootstrap email or an allowed
// admin domain (e.g. @udp.cl) and it has no admin_roles row yet, it is
// upgraded to superadmin automatically before the Principal is resolved.
func (h *Handlers) requireAdmin(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		user, err := h.auth.UserFromBearer(r.Context(), r.Header.Get("Authorization"))
		if err != nil {
			writeError(w, http.StatusUnauthorized, "unauthorized")
			return
		}
		userID := userString(user, "id", "uid")
		email := strings.ToLower(userString(user, "email"))

		if h.bootstrapEmails[email] || (email != "" && h.adminDomains[emailDomain(email)]) {
			if _, err := h.repo.FindPrincipalByEmail(r.Context(), userID, email); err != nil {
				if err := h.repo.UpsertSuperadmin(r.Context(), userID); err != nil {
					writeError(w, http.StatusInternalServerError, err.Error())
					return
				}
			}
		}

		principal, err := h.repo.FindPrincipalByEmail(r.Context(), userID, email)
		if err != nil {
			writeError(w, http.StatusForbidden, errForbidden.Error())
			return
		}
		ctx := context.WithValue(r.Context(), principalContextKey, principal)
		next(w, r.WithContext(ctx))
	}
}

// requireAdminWrite additionally requires the principal to hold permission
// (superadmins always pass).
func (h *Handlers) requireAdminWrite(permission string, next http.HandlerFunc) http.HandlerFunc {
	return h.requireAdmin(func(w http.ResponseWriter, r *http.Request) {
		principal := principalFromContext(r)
		if !principal.Can(permission) {
			writeError(w, http.StatusForbidden, "admin permission required")
			return
		}
		next(w, r)
	})
}

// requireClinicWrite requires permission AND, for a clinic_admin principal,
// that clinicOf(r) matches the principal's own clinic_slug. Superadmins may
// write to any clinic. clinicOf typically reads a path value or a body field
// that names the target clinic (e.g. faqs.clinic_slug).
func (h *Handlers) requireClinicWrite(permission string, clinicOf func(*http.Request) string, next http.HandlerFunc) http.HandlerFunc {
	return h.requireAdminWrite(permission, func(w http.ResponseWriter, r *http.Request) {
		principal := principalFromContext(r)
		if principal.Role == RoleSuperadmin {
			next(w, r)
			return
		}
		targetClinic := strings.TrimSpace(clinicOf(r))
		if targetClinic == "" || targetClinic != principal.ClinicSlug {
			writeError(w, http.StatusForbidden, "clinic scope mismatch")
			return
		}
		next(w, r)
	})
}
