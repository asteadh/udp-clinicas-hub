package admin

import (
	"context"
	"errors"
	"net/http"
	"regexp"
	"strings"
	"time"

	"github.com/jackc/pgx/v5"

	"hubnegocios/backend/internal/auth"
)

func (r *Repository) ListArticlesAdmin(ctx context.Context, clinicSlug string, status string) ([]map[string]any, error) {
	query := `
SELECT jsonb_build_object(
  'id', id, 'clinicSlug', clinic_slug, 'slug', slug, 'title', title, 'excerpt', excerpt,
  'coverImageUrl', cover_image_url, 'authorName', author_name, 'isPublished', is_published,
  'publishedAt', published_at, 'createdAt', created_at, 'updatedAt', updated_at
)
FROM articles WHERE ($1 = '' OR clinic_slug = $1) AND ($2 = '' OR (($2 = 'published' AND is_published) OR ($2 = 'draft' AND NOT is_published)))
ORDER BY created_at DESC`
	return r.listJSON(ctx, query, clinicSlug, status)
}

func (r *Repository) GetArticle(ctx context.Context, id string) (map[string]any, error) {
	return r.oneJSON(ctx, `
SELECT jsonb_build_object(
  'id', id, 'clinicSlug', clinic_slug, 'slug', slug, 'title', title, 'excerpt', excerpt,
  'bodyHtml', body_html, 'coverImageUrl', cover_image_url, 'authorName', author_name,
  'isPublished', is_published, 'publishedAt', published_at
)
FROM articles WHERE id = $1`, id)
}

func (r *Repository) CreateArticle(ctx context.Context, clinicSlug string, slug string, title string, excerpt string, bodyHTML string, coverImageURL string, authorName string) (string, error) {
	id, err := auth.NewID("art")
	if err != nil {
		return "", err
	}
	_, err = r.pool.Exec(ctx, `
INSERT INTO articles (id, clinic_slug, slug, title, excerpt, body_html, cover_image_url, author_name)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
		id, clinicSlug, slug, title, excerpt, bodyHTML, coverImageURL, authorName)
	if err != nil {
		return "", err
	}
	return id, nil
}

func (r *Repository) UpdateArticle(ctx context.Context, id string, fields map[string]any) error {
	_, err := r.pool.Exec(ctx, `
UPDATE articles SET
  title = coalesce($2, title),
  slug = coalesce($3, slug),
  excerpt = coalesce($4, excerpt),
  body_html = coalesce($5, body_html),
  cover_image_url = coalesce($6, cover_image_url),
  author_name = coalesce($7, author_name),
  is_published = coalesce($8, is_published),
  updated_at = now()
WHERE id = $1`,
		id,
		nilIfEmptyAny(fields["title"]),
		nilIfEmptyAny(fields["slug"]),
		nilIfEmptyAny(fields["excerpt"]),
		nilIfEmptyAny(fields["bodyHtml"]),
		nilIfEmptyAny(fields["coverImageUrl"]),
		nilIfEmptyAny(fields["authorName"]),
		fields["isPublished"],
	)
	return err
}

func (r *Repository) DeleteArticle(ctx context.Context, id string) error {
	_, err := r.pool.Exec(ctx, `DELETE FROM articles WHERE id = $1`, id)
	return err
}

func (r *Repository) PublishArticle(ctx context.Context, id string) error {
	_, err := r.pool.Exec(ctx, `UPDATE articles SET is_published = true, published_at = now(), updated_at = now() WHERE id = $1`, id)
	return err
}

func (r *Repository) GetArticleClinic(ctx context.Context, id string) (string, error) {
	var clinicSlug string
	err := r.pool.QueryRow(ctx, `SELECT clinic_slug FROM articles WHERE id = $1`, id).Scan(&clinicSlug)
	if errors.Is(err, pgx.ErrNoRows) {
		return "", errors.New("article not found")
	}
	return clinicSlug, err
}

var slugNonAlnum = regexp.MustCompile(`[^a-z0-9]+`)

func slugify(title string) string {
	s := strings.ToLower(strings.TrimSpace(title))
	s = slugNonAlnum.ReplaceAllString(s, "-")
	s = strings.Trim(s, "-")
	if s == "" {
		s = time.Now().UTC().Format("20060102150405")
	}
	return s
}

// --- HTTP handlers --------------------------------------------------------

func (h *Handlers) articleClinicFromBody(r *http.Request) string {
	if clinicSlug := r.URL.Query().Get("clinic"); clinicSlug != "" {
		return clinicSlug
	}
	var body struct {
		ClinicSlug string `json:"clinicSlug"`
	}
	_ = readJSONPeek(r, &body)
	return body.ClinicSlug
}

func (h *Handlers) articleClinicFromID(r *http.Request) string {
	clinicSlug, err := h.repo.GetArticleClinic(r.Context(), r.PathValue("id"))
	if err != nil {
		return ""
	}
	return clinicSlug
}

func (h *Handlers) listArticles(w http.ResponseWriter, r *http.Request) {
	clinicSlug := r.URL.Query().Get("clinic")
	principal := principalFromContext(r)
	if principal.Role != RoleSuperadmin {
		clinicSlug = principal.ClinicSlug
	}
	status := r.URL.Query().Get("status")
	values, err := h.repo.ListArticlesAdmin(r.Context(), clinicSlug, status)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"articles": values})
}

func (h *Handlers) getArticle(w http.ResponseWriter, r *http.Request) {
	value, err := h.repo.GetArticle(r.Context(), r.PathValue("id"))
	if err != nil {
		writeError(w, http.StatusNotFound, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"article": value})
}

type createArticleRequest struct {
	ClinicSlug    string `json:"clinicSlug"`
	Slug          string `json:"slug"`
	Title         string `json:"title"`
	Excerpt       string `json:"excerpt"`
	BodyHTML      string `json:"bodyHtml"`
	CoverImageURL string `json:"coverImageUrl"`
	AuthorName    string `json:"authorName"`
}

func (h *Handlers) createArticle(w http.ResponseWriter, r *http.Request) {
	var body createArticleRequest
	if err := readJSON(r, &body); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	slug := strings.TrimSpace(body.Slug)
	if slug == "" {
		slug = slugify(body.Title)
	}
	id, err := h.repo.CreateArticle(r.Context(), body.ClinicSlug, slug, body.Title, body.Excerpt, sanitizeHTML(body.BodyHTML), body.CoverImageURL, body.AuthorName)
	if err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	actor := principalFromContext(r)
	_ = h.repo.InsertAuditLog(r.Context(), actor.UserID, "article.create", "article", id, map[string]any{"clinicSlug": body.ClinicSlug, "title": body.Title})
	writeJSON(w, http.StatusCreated, map[string]any{"id": id})
}

type updateArticleRequest struct {
	Title         *string `json:"title"`
	Slug          *string `json:"slug"`
	Excerpt       *string `json:"excerpt"`
	BodyHTML      *string `json:"bodyHtml"`
	CoverImageURL *string `json:"coverImageUrl"`
	AuthorName    *string `json:"authorName"`
	IsPublished   *bool   `json:"isPublished"`
}

func (h *Handlers) updateArticle(w http.ResponseWriter, r *http.Request) {
	var body updateArticleRequest
	if err := readJSON(r, &body); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	id := r.PathValue("id")
	fields := map[string]any{}
	if body.Title != nil {
		fields["title"] = *body.Title
	}
	if body.Slug != nil {
		fields["slug"] = *body.Slug
	}
	if body.Excerpt != nil {
		fields["excerpt"] = *body.Excerpt
	}
	if body.BodyHTML != nil {
		fields["bodyHtml"] = sanitizeHTML(*body.BodyHTML)
	}
	if body.CoverImageURL != nil {
		fields["coverImageUrl"] = *body.CoverImageURL
	}
	if body.AuthorName != nil {
		fields["authorName"] = *body.AuthorName
	}
	if body.IsPublished != nil {
		fields["isPublished"] = *body.IsPublished
	}
	if err := h.repo.UpdateArticle(r.Context(), id, fields); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	actor := principalFromContext(r)
	_ = h.repo.InsertAuditLog(r.Context(), actor.UserID, "article.update", "article", id, fields)
	writeJSON(w, http.StatusOK, map[string]any{"status": true})
}

func (h *Handlers) deleteArticle(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	if err := h.repo.DeleteArticle(r.Context(), id); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	actor := principalFromContext(r)
	_ = h.repo.InsertAuditLog(r.Context(), actor.UserID, "article.delete", "article", id, nil)
	writeJSON(w, http.StatusOK, map[string]any{"status": true})
}

func (h *Handlers) publishArticle(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	if err := h.repo.PublishArticle(r.Context(), id); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	actor := principalFromContext(r)
	_ = h.repo.InsertAuditLog(r.Context(), actor.UserID, "article.publish", "article", id, nil)
	writeJSON(w, http.StatusOK, map[string]any{"status": true})
}
