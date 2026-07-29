package admin

import (
	"context"
	"errors"
	"net/http"

	"github.com/jackc/pgx/v5"
)

func (r *Repository) ListIntakeRequests(ctx context.Context, clinicSlug string, status string) ([]map[string]any, error) {
	return r.listJSON(ctx, `
SELECT jsonb_build_object(
  'id', id, 'clinicSlug', clinic_slug, 'fullName', full_name, 'rut', rut, 'email', email, 'phone', phone,
  'caseType', case_type, 'caseDescription', case_description, 'hasDocumentation', has_documentation,
  'status', status, 'handledBy', handled_by, 'internalNotes', internal_notes,
  'createdAt', created_at, 'updatedAt', updated_at
)
FROM intake_requests WHERE ($1 = '' OR clinic_slug = $1) AND ($2 = '' OR status = $2)
ORDER BY created_at DESC`, clinicSlug, status)
}

func (r *Repository) UpdateIntakeRequestStatus(ctx context.Context, id string, status string, handledBy string, internalNotes string) error {
	_, err := r.pool.Exec(ctx, `
UPDATE intake_requests SET
  status = coalesce($2, status),
  handled_by = coalesce($3, handled_by),
  internal_notes = coalesce($4, internal_notes),
  updated_at = now()
WHERE id = $1`, id, nilIfEmptyAny(status), nilIfEmptyAny(handledBy), nilIfEmptyAny(internalNotes))
	return err
}

func (r *Repository) GetIntakeRequestClinic(ctx context.Context, id string) (string, error) {
	var clinicSlug string
	err := r.pool.QueryRow(ctx, `SELECT clinic_slug FROM intake_requests WHERE id = $1`, id).Scan(&clinicSlug)
	if errors.Is(err, pgx.ErrNoRows) {
		return "", errors.New("intake request not found")
	}
	return clinicSlug, err
}

// --- HTTP handlers --------------------------------------------------------

// intakeRequestClinicFromID resolves clinic scope for an intake request.
// intake_requests always carries a clinic_slug (NOT NULL per migration 010),
// so scoping is straightforward — a clinic_admin only sees/edits their own
// clinic's requests via requireClinicWrite's mismatch check.
func (h *Handlers) intakeRequestClinicFromID(r *http.Request) string {
	clinicSlug, err := h.repo.GetIntakeRequestClinic(r.Context(), r.PathValue("id"))
	if err != nil {
		return ""
	}
	return clinicSlug
}

func (h *Handlers) listIntakeRequests(w http.ResponseWriter, r *http.Request) {
	clinicSlug := r.URL.Query().Get("clinic")
	principal := principalFromContext(r)
	if principal.Role != RoleSuperadmin {
		clinicSlug = principal.ClinicSlug
	}
	status := r.URL.Query().Get("status")
	values, err := h.repo.ListIntakeRequests(r.Context(), clinicSlug, status)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"intakeRequests": values})
}

type updateIntakeRequest struct {
	Status        string `json:"status"`
	InternalNotes string `json:"internalNotes"`
}

func (h *Handlers) updateIntakeRequestHandler(w http.ResponseWriter, r *http.Request) {
	var body updateIntakeRequest
	if err := readJSON(r, &body); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	id := r.PathValue("id")
	actor := principalFromContext(r)
	if err := h.repo.UpdateIntakeRequestStatus(r.Context(), id, body.Status, actor.UserID, body.InternalNotes); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	_ = h.repo.InsertAuditLog(r.Context(), actor.UserID, "intake_request.update", "intake_request", id, map[string]any{"status": body.Status})
	writeJSON(w, http.StatusOK, map[string]any{"status": true})
}
