package admin

import "net/http"

// me returns the resolved Principal for the calling admin: role, clinicSlug
// (empty for superadmins), and permissions. Lets the admin frontend decide
// which nav groups/panels to show without duplicating the permission model.
func (h *Handlers) me(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, principalFromContext(r))
}
