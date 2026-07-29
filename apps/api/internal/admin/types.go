package admin

import "time"

const (
	RoleSuperadmin  = "superadmin"
	RoleClinicAdmin = "clinic_admin"

	PermissionAll           = "*"
	PermissionFaqsWrite     = "faqs:write"
	PermissionArticlesWrite = "articles:write"
	PermissionGalleryWrite  = "gallery:write"
	PermissionTeamWrite     = "team:write"
	PermissionContactWrite  = "contact:write"
	PermissionIntakeWrite   = "intake:write"
	PermissionClinicsWrite  = "clinics:write"
	PermissionUsersWrite    = "users:write"
	PermissionSettingsWrite = "settings:write"
)

// Principal is the resolved identity of an authenticated admin request.
// ClinicSlug is empty for a superadmin (full access across clinics) and
// required for a clinic_admin, whose writes are scoped to that one clinic.
type Principal struct {
	UserID      string   `json:"userId"`
	Email       string   `json:"email"`
	Role        string   `json:"role"`
	ClinicSlug  string   `json:"clinicSlug,omitempty"`
	Permissions []string `json:"permissions"`
}

// Can reports whether the principal may perform action. Superadmins can do
// anything; clinic_admin principals need the specific permission (or "*").
func (p Principal) Can(action string) bool {
	if p.Role == RoleSuperadmin {
		return true
	}
	for _, permission := range p.Permissions {
		if permission == action || permission == PermissionAll {
			return true
		}
	}
	return false
}

type AuditEntry struct {
	ActorID    string         `json:"actorId"`
	Action     string         `json:"action"`
	TargetType string         `json:"targetType"`
	TargetID   string         `json:"targetId"`
	Metadata   map[string]any `json:"metadata"`
	CreatedAt  time.Time      `json:"createdAt"`
}
