package admin

import "net/http"

// RegisterContent mounts the clinic-scoped content CRUD, settings, summary,
// and audit routes added in phase 3. Called from Register.
func (h *Handlers) RegisterContent(mux *http.ServeMux) {
	// Clinics — read open to any admin, write superadmin-only.
	mux.HandleFunc("GET /api/admin/clinics", h.requireAdmin(h.adminClinics))
	mux.HandleFunc("PATCH /api/admin/clinics/{slug}", h.requireAdminWrite(PermissionClinicsWrite, h.updateClinic))

	// FAQs.
	mux.HandleFunc("GET /api/admin/faqs", h.requireAdmin(h.listFaqs))
	mux.HandleFunc("POST /api/admin/faqs", h.requireClinicWrite(PermissionFaqsWrite, h.faqClinicFromBody, h.createFaq))
	mux.HandleFunc("PATCH /api/admin/faqs/{id}", h.requireClinicWrite(PermissionFaqsWrite, h.faqClinicFromID, h.updateFaq))
	mux.HandleFunc("DELETE /api/admin/faqs/{id}", h.requireClinicWrite(PermissionFaqsWrite, h.faqClinicFromID, h.deleteFaq))
	mux.HandleFunc("POST /api/admin/faqs/reorder", h.requireClinicWrite(PermissionFaqsWrite, h.faqClinicFromBody, h.reorderFaqs))

	// Articles.
	mux.HandleFunc("GET /api/admin/articles", h.requireAdmin(h.listArticles))
	mux.HandleFunc("POST /api/admin/articles", h.requireClinicWrite(PermissionArticlesWrite, h.articleClinicFromBody, h.createArticle))
	mux.HandleFunc("GET /api/admin/articles/{id}", h.requireAdmin(h.getArticle))
	mux.HandleFunc("PATCH /api/admin/articles/{id}", h.requireClinicWrite(PermissionArticlesWrite, h.articleClinicFromID, h.updateArticle))
	mux.HandleFunc("DELETE /api/admin/articles/{id}", h.requireClinicWrite(PermissionArticlesWrite, h.articleClinicFromID, h.deleteArticle))
	mux.HandleFunc("POST /api/admin/articles/{id}/publish", h.requireClinicWrite(PermissionArticlesWrite, h.articleClinicFromID, h.publishArticle))

	// Gallery.
	mux.HandleFunc("GET /api/admin/gallery/albums", h.requireAdmin(h.listAlbums))
	mux.HandleFunc("POST /api/admin/gallery/albums", h.requireClinicWrite(PermissionGalleryWrite, h.albumClinicFromBody, h.createAlbum))
	mux.HandleFunc("PATCH /api/admin/gallery/albums/{id}", h.requireClinicWrite(PermissionGalleryWrite, h.albumClinicFromID, h.updateAlbum))
	mux.HandleFunc("DELETE /api/admin/gallery/albums/{id}", h.requireClinicWrite(PermissionGalleryWrite, h.albumClinicFromID, h.deleteAlbum))
	mux.HandleFunc("POST /api/admin/gallery/albums/{id}/photos", h.requireClinicWrite(PermissionGalleryWrite, h.albumClinicFromID, h.addPhoto))
	mux.HandleFunc("PATCH /api/admin/gallery/photos/{id}", h.requireClinicWrite(PermissionGalleryWrite, h.albumClinicFromPhoto, h.updatePhoto))
	mux.HandleFunc("DELETE /api/admin/gallery/photos/{id}", h.requireClinicWrite(PermissionGalleryWrite, h.albumClinicFromPhoto, h.deletePhoto))

	// Team.
	mux.HandleFunc("GET /api/admin/team", h.requireAdmin(h.listTeam))
	mux.HandleFunc("POST /api/admin/team", h.requireClinicWrite(PermissionTeamWrite, h.teamClinicFromBody, h.createTeamMember))
	mux.HandleFunc("PATCH /api/admin/team/{id}", h.requireClinicWrite(PermissionTeamWrite, h.teamClinicFromID, h.updateTeamMember))
	mux.HandleFunc("DELETE /api/admin/team/{id}", h.requireClinicWrite(PermissionTeamWrite, h.teamClinicFromID, h.deleteTeamMember))

	// Contact inquiries.
	mux.HandleFunc("GET /api/admin/contact-inquiries", h.requireAdmin(h.listInquiries))
	mux.HandleFunc("PATCH /api/admin/contact-inquiries/{id}", h.requireClinicWrite(PermissionContactWrite, h.inquiryClinicFromID, h.updateInquiry))

	// Settings — superadmin-only, institutional (no clinic scope).
	mux.HandleFunc("GET /api/admin/settings", h.requireAdminWrite(PermissionSettingsWrite, h.listSettings))
	mux.HandleFunc("PATCH /api/admin/settings/{key}", h.requireAdminWrite(PermissionSettingsWrite, h.updateSetting))

	// Summary + audit.
	mux.HandleFunc("GET /api/admin/summary", h.requireAdmin(h.summary))
	mux.HandleFunc("GET /api/admin/audit", h.requireAdmin(h.auditLogs))
}
