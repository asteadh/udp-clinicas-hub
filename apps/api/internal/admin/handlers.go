package admin

import "net/http"

// Handlers exposes the admin HTTP surface: admin-user management here, plus
// clinic-scoped content endpoints registered from other files in this
// package as they are added (faqs.go, articles.go, gallery.go, ...).
type Handlers struct {
	auth            AuthService
	repo            *Repository
	bootstrapEmails map[string]bool
	adminDomains    map[string]bool
}

// NewHandlers wires the admin handlers. bootstrapEmails and adminDomains
// come from config.Config.SuperadminEmails / AdminEmailDomains: an
// authenticated account matching either is auto-upgraded to superadmin on
// first admin request (see requireAdmin in access.go).
func NewHandlers(auth AuthService, repo *Repository, bootstrapEmails []string, adminDomains []string) *Handlers {
	return &Handlers{
		auth:            auth,
		repo:            repo,
		bootstrapEmails: parseEmailSet(bootstrapEmails),
		adminDomains:    parseDomainSet(adminDomains),
	}
}

func (h *Handlers) Register(mux *http.ServeMux) {
	mux.HandleFunc("GET /api/admin/admin-users", h.requireSuperadmin(h.adminUsers))
	mux.HandleFunc("POST /api/admin/admin-users", h.requireSuperadmin(h.createAdminUser))
	mux.HandleFunc("PATCH /api/admin/admin-users/{userId}", h.requireSuperadmin(h.updateAdminUser))
	mux.HandleFunc("DELETE /api/admin/admin-users/{userId}", h.requireSuperadmin(h.deleteAdminUser))

	h.RegisterContent(mux)
}
