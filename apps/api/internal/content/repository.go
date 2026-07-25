package content

import (
	"context"
	"encoding/json"
	"errors"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Repository struct {
	pool *pgxpool.Pool
}

func NewRepository(pool *pgxpool.Pool) *Repository {
	return &Repository{pool: pool}
}

var ErrNotFound = errors.New("not found")

func (r *Repository) listJSON(ctx context.Context, query string, args ...any) ([]map[string]any, error) {
	rows, err := r.pool.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	values := []map[string]any{}
	for rows.Next() {
		var raw []byte
		if err := rows.Scan(&raw); err != nil {
			return nil, err
		}
		var value map[string]any
		if err := json.Unmarshal(raw, &value); err != nil {
			return nil, err
		}
		values = append(values, value)
	}
	return values, rows.Err()
}

func (r *Repository) oneJSON(ctx context.Context, query string, args ...any) (map[string]any, error) {
	var raw []byte
	err := r.pool.QueryRow(ctx, query, args...).Scan(&raw)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, ErrNotFound
	}
	if err != nil {
		return nil, err
	}
	value := map[string]any{}
	return value, json.Unmarshal(raw, &value)
}

func (r *Repository) ListClinics(ctx context.Context) ([]map[string]any, error) {
	return r.listJSON(ctx, `
SELECT jsonb_build_object(
  'slug', slug, 'name', name, 'shortDescription', short_description,
  'icon', icon, 'colorPrimary', color_primary, 'imageUrl', image_url,
  'contactEmail', contact_email, 'sortOrder', sort_order
)
FROM clinics WHERE is_active = true ORDER BY sort_order, name`)
}

func (r *Repository) GetClinicBySlug(ctx context.Context, slug string) (map[string]any, error) {
	return r.oneJSON(ctx, `
SELECT jsonb_build_object(
  'slug', slug, 'name', name, 'shortDescription', short_description,
  'descriptionHtml', description_html, 'icon', icon, 'colorPrimary', color_primary,
  'imageUrl', image_url, 'contactEmail', contact_email, 'sortOrder', sort_order
)
FROM clinics WHERE slug = $1 AND is_active = true`, slug)
}

func (r *Repository) ListFaqsByClinic(ctx context.Context, clinicSlug string) ([]map[string]any, error) {
	return r.listJSON(ctx, `
SELECT jsonb_build_object('id', id, 'question', question, 'answerHtml', answer_html, 'sortOrder', sort_order)
FROM faqs WHERE clinic_slug = $1 AND is_published = true ORDER BY sort_order, created_at`, clinicSlug)
}

func (r *Repository) ListArticles(ctx context.Context, clinicSlug string, page int) ([]map[string]any, error) {
	if page < 1 {
		page = 1
	}
	const pageSize = 20
	offset := (page - 1) * pageSize
	if clinicSlug != "" {
		return r.listJSON(ctx, `
SELECT jsonb_build_object(
  'id', id, 'clinicSlug', clinic_slug, 'slug', slug, 'title', title, 'excerpt', excerpt,
  'coverImageUrl', cover_image_url, 'authorName', author_name, 'publishedAt', published_at
)
FROM articles WHERE clinic_slug = $1 AND is_published = true
ORDER BY published_at DESC LIMIT $2 OFFSET $3`, clinicSlug, pageSize, offset)
	}
	return r.listJSON(ctx, `
SELECT jsonb_build_object(
  'id', id, 'clinicSlug', clinic_slug, 'slug', slug, 'title', title, 'excerpt', excerpt,
  'coverImageUrl', cover_image_url, 'authorName', author_name, 'publishedAt', published_at
)
FROM articles WHERE is_published = true
ORDER BY published_at DESC LIMIT $1 OFFSET $2`, pageSize, offset)
}

func (r *Repository) GetArticleBySlug(ctx context.Context, clinicSlug string, slug string) (map[string]any, error) {
	return r.oneJSON(ctx, `
SELECT jsonb_build_object(
  'id', id, 'clinicSlug', clinic_slug, 'slug', slug, 'title', title, 'excerpt', excerpt,
  'bodyHtml', body_html, 'coverImageUrl', cover_image_url, 'authorName', author_name, 'publishedAt', published_at
)
FROM articles WHERE clinic_slug = $1 AND slug = $2 AND is_published = true`, clinicSlug, slug)
}

// GetArticleBySlugAny resolves an article by slug alone (used by the
// cross-clinic GET /api/articles/{slug} route).
func (r *Repository) GetArticleBySlugAny(ctx context.Context, slug string) (map[string]any, error) {
	return r.oneJSON(ctx, `
SELECT jsonb_build_object(
  'id', id, 'clinicSlug', clinic_slug, 'slug', slug, 'title', title, 'excerpt', excerpt,
  'bodyHtml', body_html, 'coverImageUrl', cover_image_url, 'authorName', author_name, 'publishedAt', published_at
)
FROM articles WHERE slug = $1 AND is_published = true`, slug)
}

func (r *Repository) ListGalleryAlbumsByClinic(ctx context.Context, clinicSlug string) ([]map[string]any, error) {
	return r.listJSON(ctx, `
SELECT jsonb_build_object(
  'id', id, 'clinicSlug', clinic_slug, 'title', title, 'description', description,
  'coverImageUrl', cover_image_url, 'sortOrder', sort_order
)
FROM gallery_albums WHERE clinic_slug = $1 AND is_published = true ORDER BY sort_order, created_at`, clinicSlug)
}

func (r *Repository) GetGalleryAlbum(ctx context.Context, albumID string) (map[string]any, error) {
	album, err := r.oneJSON(ctx, `
SELECT jsonb_build_object(
  'id', id, 'clinicSlug', clinic_slug, 'title', title, 'description', description,
  'coverImageUrl', cover_image_url, 'sortOrder', sort_order
)
FROM gallery_albums WHERE id = $1 AND is_published = true`, albumID)
	if err != nil {
		return nil, err
	}
	photos, err := r.listJSON(ctx, `
SELECT jsonb_build_object('id', id, 'imageUrl', image_url, 'caption', caption, 'sortOrder', sort_order)
FROM gallery_photos WHERE album_id = $1 ORDER BY sort_order, created_at`, albumID)
	if err != nil {
		return nil, err
	}
	album["photos"] = photos
	return album, nil
}

func (r *Repository) ListTeamByClinic(ctx context.Context, clinicSlug string) ([]map[string]any, error) {
	return r.listJSON(ctx, `
SELECT jsonb_build_object(
  'id', id, 'fullName', full_name, 'roleTitle', role_title, 'bioHtml', bio_html,
  'photoUrl', photo_url, 'email', email, 'sortOrder', sort_order
)
FROM team_members WHERE clinic_slug = $1 AND is_published = true ORDER BY sort_order, full_name`, clinicSlug)
}

func (r *Repository) GetPublicSettings(ctx context.Context) (map[string]any, error) {
	rows, err := r.pool.Query(ctx, `SELECT key, value FROM app_settings`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	settings := map[string]any{}
	for rows.Next() {
		var key string
		var raw []byte
		if err := rows.Scan(&key, &raw); err != nil {
			return nil, err
		}
		var value any
		if err := json.Unmarshal(raw, &value); err != nil {
			return nil, err
		}
		settings[key] = value
	}
	return settings, rows.Err()
}
