package admin

import (
	"context"
	"errors"
	"net/http"

	"github.com/jackc/pgx/v5"
)

func (r *Repository) ListInquiries(ctx context.Context, clinicSlug string, status string) ([]map[string]any, error) {
	return r.listJSON(ctx, `
SELECT jsonb_build_object(
  'id', id, 'clinicSlug', clinic_slug, 'fullName', full_name, 'email', email, 'phone', phone,
  'message', message, 'status', status, 'handledBy', handled_by, 'internalNotes', internal_notes,
  'createdAt', created_at, 'updatedAt', updated_at
)
FROM contact_inquiries WHERE ($1 = '' OR clinic_slug = $1) AND ($2 = '' OR status = $2)
ORDER BY created_at DESC`, clinicSlug, status)
}

func (r *Repository) UpdateInquiryStatus(ctx context.Context, id string, status string, handledBy string, internalNotes string) error {
	_, err := r.pool.Exec(ctx, `
UPDATE contact_inquiries SET
  status = coalesce($2, status),
  handled_by = coalesce($3, handled_by),
  internal_notes = coalesce($4, internal_notes),
  updated_at = now()
WHERE id = $1`, id, nilIfEmptyAny(status), nilIfEmptyAny(handledBy), nilIfEmptyAny(internalNotes))
	return err
}

func (r *Repository) GetInquiryClinic(ctx context.Context, id string) (string, error) {
	var clinicSlug string
	err := r.pool.QueryRow(ctx, `SELECT clinic_slug FROM contact_inquiries WHERE id = $1`, id).Scan(&clinicSlug)
	if errors.Is(err, pgx.ErrNoRows) {
		return "", errors.New("inquiry not found")
	}
	return clinicSlug, err
}

// --- HTTP handlers --------------------------------------------------------

// inquiryClinicFromID resolves clinic scope for an inquiry. contact_inquiries
// always carries a clinic_slug (NOT NULL per migration 007), so scoping is
// straightforward — a clinic_admin only sees/edits their own clinic's
// inquiries via requireClinicWrite's mismatch check.
func (h *Handlers) inquiryClinicFromID(r *http.Request) string {
	clinicSlug, err := h.repo.GetInquiryClinic(r.Context(), r.PathValue("id"))
	if err != nil {
		return ""
	}
	return clinicSlug
}

func (h *Handlers) listInquiries(w http.ResponseWriter, r *http.Request) {
	clinicSlug := r.URL.Query().Get("clinic")
	principal := principalFromContext(r)
	if principal.Role != RoleSuperadmin {
		clinicSlug = principal.ClinicSlug
	}
	status := r.URL.Query().Get("status")
	values, err := h.repo.ListInquiries(r.Context(), clinicSlug, status)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"inquiries": values})
}

type updateInquiryRequest struct {
	Status        string `json:"status"`
	InternalNotes string `json:"internalNotes"`
}

func (h *Handlers) updateInquiry(w http.ResponseWriter, r *http.Request) {
	var body updateInquiryRequest
	if err := readJSON(r, &body); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	id := r.PathValue("id")
	actor := principalFromContext(r)
	if err := h.repo.UpdateInquiryStatus(r.Context(), id, body.Status, actor.UserID, body.InternalNotes); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	_ = h.repo.InsertAuditLog(r.Context(), actor.UserID, "contact_inquiry.update", "contact_inquiry", id, map[string]any{"status": body.Status})
	writeJSON(w, http.StatusOK, map[string]any{"status": true})
}
