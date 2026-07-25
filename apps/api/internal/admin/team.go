package admin

import (
	"context"
	"errors"
	"net/http"

	"github.com/jackc/pgx/v5"

	"hubnegocios/backend/internal/auth"
)

func (r *Repository) ListTeamAdmin(ctx context.Context, clinicSlug string) ([]map[string]any, error) {
	return r.listJSON(ctx, `
SELECT jsonb_build_object(
  'id', id, 'clinicSlug', clinic_slug, 'fullName', full_name, 'roleTitle', role_title,
  'bioHtml', bio_html, 'photoUrl', photo_url, 'email', email, 'sortOrder', sort_order,
  'isPublished', is_published, 'createdAt', created_at, 'updatedAt', updated_at
)
FROM team_members WHERE clinic_slug = $1 ORDER BY sort_order, full_name`, clinicSlug)
}

func (r *Repository) CreateTeamMember(ctx context.Context, clinicSlug string, fullName string, roleTitle string, bioHTML string, photoURL string, email string) (string, error) {
	id, err := auth.NewID("team")
	if err != nil {
		return "", err
	}
	_, err = r.pool.Exec(ctx, `
INSERT INTO team_members (id, clinic_slug, full_name, role_title, bio_html, photo_url, email)
VALUES ($1, $2, $3, $4, $5, $6, $7)`, id, clinicSlug, fullName, roleTitle, bioHTML, photoURL, email)
	if err != nil {
		return "", err
	}
	return id, nil
}

func (r *Repository) UpdateTeamMember(ctx context.Context, id string, fields map[string]any) error {
	_, err := r.pool.Exec(ctx, `
UPDATE team_members SET
  full_name = coalesce($2, full_name),
  role_title = coalesce($3, role_title),
  bio_html = coalesce($4, bio_html),
  photo_url = coalesce($5, photo_url),
  email = coalesce($6, email),
  sort_order = coalesce($7, sort_order),
  is_published = coalesce($8, is_published),
  updated_at = now()
WHERE id = $1`,
		id,
		nilIfEmptyAny(fields["fullName"]),
		nilIfEmptyAny(fields["roleTitle"]),
		nilIfEmptyAny(fields["bioHtml"]),
		nilIfEmptyAny(fields["photoUrl"]),
		nilIfEmptyAny(fields["email"]),
		fields["sortOrder"],
		fields["isPublished"],
	)
	return err
}

func (r *Repository) DeleteTeamMember(ctx context.Context, id string) error {
	_, err := r.pool.Exec(ctx, `DELETE FROM team_members WHERE id = $1`, id)
	return err
}

func (r *Repository) GetTeamMemberClinic(ctx context.Context, id string) (string, error) {
	var clinicSlug string
	err := r.pool.QueryRow(ctx, `SELECT clinic_slug FROM team_members WHERE id = $1`, id).Scan(&clinicSlug)
	if errors.Is(err, pgx.ErrNoRows) {
		return "", errors.New("team member not found")
	}
	return clinicSlug, err
}

// --- HTTP handlers --------------------------------------------------------

func (h *Handlers) teamClinicFromBody(r *http.Request) string {
	if clinicSlug := r.URL.Query().Get("clinic"); clinicSlug != "" {
		return clinicSlug
	}
	var body struct {
		ClinicSlug string `json:"clinicSlug"`
	}
	_ = readJSONPeek(r, &body)
	return body.ClinicSlug
}

func (h *Handlers) teamClinicFromID(r *http.Request) string {
	clinicSlug, err := h.repo.GetTeamMemberClinic(r.Context(), r.PathValue("id"))
	if err != nil {
		return ""
	}
	return clinicSlug
}

func (h *Handlers) listTeam(w http.ResponseWriter, r *http.Request) {
	clinicSlug := r.URL.Query().Get("clinic")
	principal := principalFromContext(r)
	if principal.Role != RoleSuperadmin {
		clinicSlug = principal.ClinicSlug
	}
	if clinicSlug == "" {
		writeError(w, http.StatusBadRequest, "clinic query param is required")
		return
	}
	values, err := h.repo.ListTeamAdmin(r.Context(), clinicSlug)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"team": values})
}

type createTeamMemberRequest struct {
	ClinicSlug string `json:"clinicSlug"`
	FullName   string `json:"fullName"`
	RoleTitle  string `json:"roleTitle"`
	BioHTML    string `json:"bioHtml"`
	PhotoURL   string `json:"photoUrl"`
	Email      string `json:"email"`
}

func (h *Handlers) createTeamMember(w http.ResponseWriter, r *http.Request) {
	var body createTeamMemberRequest
	if err := readJSON(r, &body); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	id, err := h.repo.CreateTeamMember(r.Context(), body.ClinicSlug, body.FullName, body.RoleTitle, sanitizeHTML(body.BioHTML), body.PhotoURL, body.Email)
	if err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	actor := principalFromContext(r)
	_ = h.repo.InsertAuditLog(r.Context(), actor.UserID, "team_member.create", "team_member", id, map[string]any{"clinicSlug": body.ClinicSlug})
	writeJSON(w, http.StatusCreated, map[string]any{"id": id})
}

type updateTeamMemberRequest struct {
	FullName    *string `json:"fullName"`
	RoleTitle   *string `json:"roleTitle"`
	BioHTML     *string `json:"bioHtml"`
	PhotoURL    *string `json:"photoUrl"`
	Email       *string `json:"email"`
	SortOrder   *int    `json:"sortOrder"`
	IsPublished *bool   `json:"isPublished"`
}

func (h *Handlers) updateTeamMember(w http.ResponseWriter, r *http.Request) {
	var body updateTeamMemberRequest
	if err := readJSON(r, &body); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	id := r.PathValue("id")
	fields := map[string]any{}
	if body.FullName != nil {
		fields["fullName"] = *body.FullName
	}
	if body.RoleTitle != nil {
		fields["roleTitle"] = *body.RoleTitle
	}
	if body.BioHTML != nil {
		fields["bioHtml"] = sanitizeHTML(*body.BioHTML)
	}
	if body.PhotoURL != nil {
		fields["photoUrl"] = *body.PhotoURL
	}
	if body.Email != nil {
		fields["email"] = *body.Email
	}
	if body.SortOrder != nil {
		fields["sortOrder"] = *body.SortOrder
	}
	if body.IsPublished != nil {
		fields["isPublished"] = *body.IsPublished
	}
	if err := h.repo.UpdateTeamMember(r.Context(), id, fields); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	actor := principalFromContext(r)
	_ = h.repo.InsertAuditLog(r.Context(), actor.UserID, "team_member.update", "team_member", id, fields)
	writeJSON(w, http.StatusOK, map[string]any{"status": true})
}

func (h *Handlers) deleteTeamMember(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	if err := h.repo.DeleteTeamMember(r.Context(), id); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	actor := principalFromContext(r)
	_ = h.repo.InsertAuditLog(r.Context(), actor.UserID, "team_member.delete", "team_member", id, nil)
	writeJSON(w, http.StatusOK, map[string]any{"status": true})
}
