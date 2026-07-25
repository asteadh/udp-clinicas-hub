package admin

import (
	"context"
	"net/http"
)

func (r *Repository) ListClinicsAdmin(ctx context.Context) ([]map[string]any, error) {
	return r.listJSON(ctx, `
SELECT jsonb_build_object(
  'slug', slug, 'name', name, 'shortDescription', short_description, 'descriptionHtml', description_html,
  'icon', icon, 'colorPrimary', color_primary, 'imageUrl', image_url, 'contactEmail', contact_email,
  'sortOrder', sort_order, 'isActive', is_active, 'createdAt', created_at, 'updatedAt', updated_at
)
FROM clinics ORDER BY sort_order, name`)
}

func (r *Repository) UpdateClinic(ctx context.Context, slug string, fields map[string]any) error {
	_, err := r.pool.Exec(ctx, `
UPDATE clinics SET
  name = coalesce($2, name),
  short_description = coalesce($3, short_description),
  description_html = coalesce($4, description_html),
  icon = coalesce($5, icon),
  color_primary = coalesce($6, color_primary),
  image_url = coalesce($7, image_url),
  contact_email = coalesce($8, contact_email),
  sort_order = coalesce($9, sort_order),
  is_active = coalesce($10, is_active),
  updated_at = now()
WHERE slug = $1`,
		slug,
		nilIfEmptyAny(fields["name"]),
		nilIfEmptyAny(fields["shortDescription"]),
		nilIfEmptyAny(fields["descriptionHtml"]),
		nilIfEmptyAny(fields["icon"]),
		nilIfEmptyAny(fields["colorPrimary"]),
		nilIfEmptyAny(fields["imageUrl"]),
		nilIfEmptyAny(fields["contactEmail"]),
		fields["sortOrder"],
		fields["isActive"],
	)
	return err
}

func nilIfEmptyAny(value any) any {
	if s, ok := value.(string); ok && s == "" {
		return nil
	}
	return value
}

type updateClinicRequest struct {
	Name             *string `json:"name"`
	ShortDescription *string `json:"shortDescription"`
	DescriptionHTML  *string `json:"descriptionHtml"`
	Icon             *string `json:"icon"`
	ColorPrimary     *string `json:"colorPrimary"`
	ImageURL         *string `json:"imageUrl"`
	ContactEmail     *string `json:"contactEmail"`
	SortOrder        *int    `json:"sortOrder"`
	IsActive         *bool   `json:"isActive"`
}

func (h *Handlers) adminClinics(w http.ResponseWriter, r *http.Request) {
	values, err := h.repo.ListClinicsAdmin(r.Context())
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"clinics": values})
}

func (h *Handlers) updateClinic(w http.ResponseWriter, r *http.Request) {
	var body updateClinicRequest
	if err := readJSON(r, &body); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	slug := r.PathValue("slug")
	fields := map[string]any{}
	if body.Name != nil {
		fields["name"] = *body.Name
	}
	if body.ShortDescription != nil {
		fields["shortDescription"] = *body.ShortDescription
	}
	if body.DescriptionHTML != nil {
		fields["descriptionHtml"] = sanitizeHTML(*body.DescriptionHTML)
	}
	if body.Icon != nil {
		fields["icon"] = *body.Icon
	}
	if body.ColorPrimary != nil {
		fields["colorPrimary"] = *body.ColorPrimary
	}
	if body.ImageURL != nil {
		fields["imageUrl"] = *body.ImageURL
	}
	if body.ContactEmail != nil {
		fields["contactEmail"] = *body.ContactEmail
	}
	if body.SortOrder != nil {
		fields["sortOrder"] = *body.SortOrder
	}
	if body.IsActive != nil {
		fields["isActive"] = *body.IsActive
	}
	if err := h.repo.UpdateClinic(r.Context(), slug, fields); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	actor := principalFromContext(r)
	_ = h.repo.InsertAuditLog(r.Context(), actor.UserID, "clinic.update", "clinic", slug, fields)
	writeJSON(w, http.StatusOK, map[string]any{"status": true})
}
