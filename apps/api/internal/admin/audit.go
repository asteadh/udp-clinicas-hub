package admin

import "net/http"

// auditLogs is superadmin-only — audit trail may expose sensitive
// cross-clinic activity, so it does not go through requireAdminWrite's
// permission model.
func (h *Handlers) auditLogs(w http.ResponseWriter, r *http.Request) {
	principal := principalFromContext(r)
	if principal.Role != RoleSuperadmin {
		writeError(w, http.StatusForbidden, "superadmin access required")
		return
	}
	values, err := h.repo.AuditLogs(r.Context())
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"auditLogs": values})
}
