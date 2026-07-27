package admin

import (
	"context"
	"errors"
	"net/http"

	"github.com/jackc/pgx/v5"

	"hubnegocios/backend/internal/auth"
)

func (r *Repository) ListFaqsAdmin(ctx context.Context, clinicSlug string) ([]map[string]any, error) {
	return r.listJSON(ctx, `
SELECT jsonb_build_object(
  'id', id, 'clinicSlug', clinic_slug, 'question', question, 'answerHtml', answer_html,
  'sortOrder', sort_order, 'isPublished', is_published, 'createdAt', created_at, 'updatedAt', updated_at
)
FROM faqs WHERE clinic_slug = $1 ORDER BY sort_order, created_at`, clinicSlug)
}

func (r *Repository) CreateFaq(ctx context.Context, clinicSlug string, question string, answerHTML string) (string, error) {
	id, err := auth.NewID("faq")
	if err != nil {
		return "", err
	}
	_, err = r.pool.Exec(ctx, `
INSERT INTO faqs (id, clinic_slug, question, answer_html) VALUES ($1, $2, $3, $4)`,
		id, clinicSlug, question, answerHTML)
	if err != nil {
		return "", err
	}
	return id, nil
}

func (r *Repository) UpdateFaq(ctx context.Context, id string, fields map[string]any) error {
	_, err := r.pool.Exec(ctx, `
UPDATE faqs SET
  question = coalesce($2, question),
  answer_html = coalesce($3, answer_html),
  sort_order = coalesce($4, sort_order),
  is_published = coalesce($5, is_published),
  updated_at = now()
WHERE id = $1`,
		id, nilIfEmptyAny(fields["question"]), nilIfEmptyAny(fields["answerHtml"]), fields["sortOrder"], fields["isPublished"])
	return err
}

func (r *Repository) DeleteFaq(ctx context.Context, id string) error {
	_, err := r.pool.Exec(ctx, `DELETE FROM faqs WHERE id = $1`, id)
	return err
}

func (r *Repository) GetFaqClinic(ctx context.Context, id string) (string, error) {
	var clinicSlug string
	err := r.pool.QueryRow(ctx, `SELECT clinic_slug FROM faqs WHERE id = $1`, id).Scan(&clinicSlug)
	if errors.Is(err, pgx.ErrNoRows) {
		return "", errors.New("faq not found")
	}
	return clinicSlug, err
}

// --- HTTP handlers --------------------------------------------------------

func (h *Handlers) faqClinicFromBody(r *http.Request) string {
	if clinicSlug := r.URL.Query().Get("clinic"); clinicSlug != "" {
		return clinicSlug
	}
	var body struct {
		ClinicSlug string `json:"clinicSlug"`
	}
	_ = readJSONPeek(r, &body)
	return body.ClinicSlug
}

func (h *Handlers) faqClinicFromID(r *http.Request) string {
	clinicSlug, err := h.repo.GetFaqClinic(r.Context(), r.PathValue("id"))
	if err != nil {
		return ""
	}
	return clinicSlug
}

func (h *Handlers) listFaqs(w http.ResponseWriter, r *http.Request) {
	clinicSlug := r.URL.Query().Get("clinic")
	principal := principalFromContext(r)
	if principal.Role != RoleSuperadmin {
		clinicSlug = principal.ClinicSlug
	}
	if clinicSlug == "" {
		writeError(w, http.StatusBadRequest, "clinic query param is required")
		return
	}
	values, err := h.repo.ListFaqsAdmin(r.Context(), clinicSlug)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"faqs": values})
}

type createFaqRequest struct {
	ClinicSlug string `json:"clinicSlug"`
	Question   string `json:"question"`
	AnswerHTML string `json:"answerHtml"`
}

func (h *Handlers) createFaq(w http.ResponseWriter, r *http.Request) {
	var body createFaqRequest
	if err := readJSON(r, &body); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	id, err := h.repo.CreateFaq(r.Context(), body.ClinicSlug, body.Question, sanitizeHTML(body.AnswerHTML))
	if err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	actor := principalFromContext(r)
	_ = h.repo.InsertAuditLog(r.Context(), actor.UserID, "faq.create", "faq", id, map[string]any{"clinicSlug": body.ClinicSlug})
	writeJSON(w, http.StatusCreated, map[string]any{"id": id})
}

type updateFaqRequest struct {
	Question    *string `json:"question"`
	AnswerHTML  *string `json:"answerHtml"`
	SortOrder   *int    `json:"sortOrder"`
	IsPublished *bool   `json:"isPublished"`
}

func (h *Handlers) updateFaq(w http.ResponseWriter, r *http.Request) {
	var body updateFaqRequest
	if err := readJSON(r, &body); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	id := r.PathValue("id")
	fields := map[string]any{}
	if body.Question != nil {
		fields["question"] = *body.Question
	}
	if body.AnswerHTML != nil {
		fields["answerHtml"] = sanitizeHTML(*body.AnswerHTML)
	}
	if body.SortOrder != nil {
		fields["sortOrder"] = *body.SortOrder
	}
	if body.IsPublished != nil {
		fields["isPublished"] = *body.IsPublished
	}
	if err := h.repo.UpdateFaq(r.Context(), id, fields); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	actor := principalFromContext(r)
	_ = h.repo.InsertAuditLog(r.Context(), actor.UserID, "faq.update", "faq", id, fields)
	writeJSON(w, http.StatusOK, map[string]any{"status": true})
}

func (h *Handlers) deleteFaq(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	if err := h.repo.DeleteFaq(r.Context(), id); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	actor := principalFromContext(r)
	_ = h.repo.InsertAuditLog(r.Context(), actor.UserID, "faq.delete", "faq", id, nil)
	writeJSON(w, http.StatusOK, map[string]any{"status": true})
}

type reorderFaqsRequest struct {
	ClinicSlug string   `json:"clinicSlug"`
	OrderedIDs []string `json:"orderedIds"`
}

func (h *Handlers) reorderFaqs(w http.ResponseWriter, r *http.Request) {
	var body reorderFaqsRequest
	if err := readJSON(r, &body); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	for index, id := range body.OrderedIDs {
		if err := h.repo.UpdateFaq(r.Context(), id, map[string]any{"sortOrder": index}); err != nil {
			writeError(w, http.StatusBadRequest, err.Error())
			return
		}
	}
	actor := principalFromContext(r)
	_ = h.repo.InsertAuditLog(r.Context(), actor.UserID, "faq.reorder", "faq", "", map[string]any{"clinicSlug": body.ClinicSlug})
	writeJSON(w, http.StatusOK, map[string]any{"status": true})
}
