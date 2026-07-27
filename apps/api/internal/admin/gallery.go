package admin

import (
	"context"
	"errors"
	"net/http"

	"github.com/jackc/pgx/v5"

	"hubnegocios/backend/internal/auth"
)

func (r *Repository) ListAlbumsAdmin(ctx context.Context, clinicSlug string) ([]map[string]any, error) {
	albums, err := r.listJSON(ctx, `
SELECT jsonb_build_object(
  'id', id, 'clinicSlug', clinic_slug, 'title', title, 'description', description,
  'coverImageUrl', cover_image_url, 'sortOrder', sort_order, 'isPublished', is_published,
  'createdAt', created_at, 'updatedAt', updated_at
)
FROM gallery_albums WHERE clinic_slug = $1 ORDER BY sort_order, created_at`, clinicSlug)
	if err != nil {
		return nil, err
	}
	for _, album := range albums {
		photos, err := r.listJSON(ctx, `
SELECT jsonb_build_object('id', id, 'imageUrl', image_url, 'caption', caption, 'sortOrder', sort_order)
FROM gallery_photos WHERE album_id = $1 ORDER BY sort_order, created_at`, album["id"])
		if err != nil {
			return nil, err
		}
		album["photos"] = photos
	}
	return albums, nil
}

func (r *Repository) CreateAlbum(ctx context.Context, clinicSlug string, title string, description string, coverImageURL string) (string, error) {
	id, err := auth.NewID("alb")
	if err != nil {
		return "", err
	}
	_, err = r.pool.Exec(ctx, `
INSERT INTO gallery_albums (id, clinic_slug, title, description, cover_image_url)
VALUES ($1, $2, $3, $4, $5)`, id, clinicSlug, title, description, coverImageURL)
	if err != nil {
		return "", err
	}
	return id, nil
}

func (r *Repository) UpdateAlbum(ctx context.Context, id string, fields map[string]any) error {
	_, err := r.pool.Exec(ctx, `
UPDATE gallery_albums SET
  title = coalesce($2, title),
  description = coalesce($3, description),
  cover_image_url = coalesce($4, cover_image_url),
  sort_order = coalesce($5, sort_order),
  is_published = coalesce($6, is_published),
  updated_at = now()
WHERE id = $1`,
		id, nilIfEmptyAny(fields["title"]), nilIfEmptyAny(fields["description"]), nilIfEmptyAny(fields["coverImageUrl"]), fields["sortOrder"], fields["isPublished"])
	return err
}

func (r *Repository) DeleteAlbum(ctx context.Context, id string) error {
	_, err := r.pool.Exec(ctx, `DELETE FROM gallery_albums WHERE id = $1`, id)
	return err
}

func (r *Repository) GetAlbumClinic(ctx context.Context, albumID string) (string, error) {
	var clinicSlug string
	err := r.pool.QueryRow(ctx, `SELECT clinic_slug FROM gallery_albums WHERE id = $1`, albumID).Scan(&clinicSlug)
	if errors.Is(err, pgx.ErrNoRows) {
		return "", errors.New("album not found")
	}
	return clinicSlug, err
}

func (r *Repository) AddPhoto(ctx context.Context, albumID string, imageURL string, caption string) (string, error) {
	id, err := auth.NewID("pho")
	if err != nil {
		return "", err
	}
	_, err = r.pool.Exec(ctx, `
INSERT INTO gallery_photos (id, album_id, image_url, caption) VALUES ($1, $2, $3, $4)`,
		id, albumID, imageURL, caption)
	if err != nil {
		return "", err
	}
	return id, nil
}

func (r *Repository) UpdatePhoto(ctx context.Context, id string, fields map[string]any) error {
	_, err := r.pool.Exec(ctx, `
UPDATE gallery_photos SET
  caption = coalesce($2, caption),
  sort_order = coalesce($3, sort_order)
WHERE id = $1`, id, nilIfEmptyAny(fields["caption"]), fields["sortOrder"])
	return err
}

func (r *Repository) DeletePhoto(ctx context.Context, id string) error {
	_, err := r.pool.Exec(ctx, `DELETE FROM gallery_photos WHERE id = $1`, id)
	return err
}

func (r *Repository) GetPhotoAlbum(ctx context.Context, photoID string) (string, error) {
	var albumID string
	err := r.pool.QueryRow(ctx, `SELECT album_id FROM gallery_photos WHERE id = $1`, photoID).Scan(&albumID)
	if errors.Is(err, pgx.ErrNoRows) {
		return "", errors.New("photo not found")
	}
	return albumID, err
}

// --- HTTP handlers --------------------------------------------------------

func (h *Handlers) albumClinicFromBody(r *http.Request) string {
	if clinicSlug := r.URL.Query().Get("clinic"); clinicSlug != "" {
		return clinicSlug
	}
	var body struct {
		ClinicSlug string `json:"clinicSlug"`
	}
	_ = readJSONPeek(r, &body)
	return body.ClinicSlug
}

func (h *Handlers) albumClinicFromID(r *http.Request) string {
	clinicSlug, err := h.repo.GetAlbumClinic(r.Context(), r.PathValue("id"))
	if err != nil {
		return ""
	}
	return clinicSlug
}

// albumClinicFromPhoto resolves clinic scope for photo sub-resources by
// looking up the photo's parent album's clinic.
func (h *Handlers) albumClinicFromPhoto(r *http.Request) string {
	albumID, err := h.repo.GetPhotoAlbum(r.Context(), r.PathValue("id"))
	if err != nil {
		return ""
	}
	clinicSlug, err := h.repo.GetAlbumClinic(r.Context(), albumID)
	if err != nil {
		return ""
	}
	return clinicSlug
}

func (h *Handlers) listAlbums(w http.ResponseWriter, r *http.Request) {
	clinicSlug := r.URL.Query().Get("clinic")
	principal := principalFromContext(r)
	if principal.Role != RoleSuperadmin {
		clinicSlug = principal.ClinicSlug
	}
	if clinicSlug == "" {
		writeError(w, http.StatusBadRequest, "clinic query param is required")
		return
	}
	values, err := h.repo.ListAlbumsAdmin(r.Context(), clinicSlug)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"albums": values})
}

type createAlbumRequest struct {
	ClinicSlug    string `json:"clinicSlug"`
	Title         string `json:"title"`
	Description   string `json:"description"`
	CoverImageURL string `json:"coverImageUrl"`
}

func (h *Handlers) createAlbum(w http.ResponseWriter, r *http.Request) {
	var body createAlbumRequest
	if err := readJSON(r, &body); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	id, err := h.repo.CreateAlbum(r.Context(), body.ClinicSlug, body.Title, body.Description, body.CoverImageURL)
	if err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	actor := principalFromContext(r)
	_ = h.repo.InsertAuditLog(r.Context(), actor.UserID, "gallery_album.create", "gallery_album", id, map[string]any{"clinicSlug": body.ClinicSlug})
	writeJSON(w, http.StatusCreated, map[string]any{"id": id})
}

type updateAlbumRequest struct {
	Title         *string `json:"title"`
	Description   *string `json:"description"`
	CoverImageURL *string `json:"coverImageUrl"`
	SortOrder     *int    `json:"sortOrder"`
	IsPublished   *bool   `json:"isPublished"`
}

func (h *Handlers) updateAlbum(w http.ResponseWriter, r *http.Request) {
	var body updateAlbumRequest
	if err := readJSON(r, &body); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	id := r.PathValue("id")
	fields := map[string]any{}
	if body.Title != nil {
		fields["title"] = *body.Title
	}
	if body.Description != nil {
		fields["description"] = *body.Description
	}
	if body.CoverImageURL != nil {
		fields["coverImageUrl"] = *body.CoverImageURL
	}
	if body.SortOrder != nil {
		fields["sortOrder"] = *body.SortOrder
	}
	if body.IsPublished != nil {
		fields["isPublished"] = *body.IsPublished
	}
	if err := h.repo.UpdateAlbum(r.Context(), id, fields); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	actor := principalFromContext(r)
	_ = h.repo.InsertAuditLog(r.Context(), actor.UserID, "gallery_album.update", "gallery_album", id, fields)
	writeJSON(w, http.StatusOK, map[string]any{"status": true})
}

func (h *Handlers) deleteAlbum(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	if err := h.repo.DeleteAlbum(r.Context(), id); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	actor := principalFromContext(r)
	_ = h.repo.InsertAuditLog(r.Context(), actor.UserID, "gallery_album.delete", "gallery_album", id, nil)
	writeJSON(w, http.StatusOK, map[string]any{"status": true})
}

type addPhotoRequest struct {
	ImageURL string `json:"imageUrl"`
	Caption  string `json:"caption"`
}

func (h *Handlers) addPhoto(w http.ResponseWriter, r *http.Request) {
	var body addPhotoRequest
	if err := readJSON(r, &body); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	albumID := r.PathValue("id")
	photoID, err := h.repo.AddPhoto(r.Context(), albumID, body.ImageURL, body.Caption)
	if err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	actor := principalFromContext(r)
	_ = h.repo.InsertAuditLog(r.Context(), actor.UserID, "gallery_photo.create", "gallery_photo", photoID, map[string]any{"albumId": albumID})
	writeJSON(w, http.StatusCreated, map[string]any{"id": photoID})
}

type updatePhotoRequest struct {
	Caption   *string `json:"caption"`
	SortOrder *int    `json:"sortOrder"`
}

func (h *Handlers) updatePhoto(w http.ResponseWriter, r *http.Request) {
	var body updatePhotoRequest
	if err := readJSON(r, &body); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	id := r.PathValue("id")
	fields := map[string]any{}
	if body.Caption != nil {
		fields["caption"] = *body.Caption
	}
	if body.SortOrder != nil {
		fields["sortOrder"] = *body.SortOrder
	}
	if err := h.repo.UpdatePhoto(r.Context(), id, fields); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	actor := principalFromContext(r)
	_ = h.repo.InsertAuditLog(r.Context(), actor.UserID, "gallery_photo.update", "gallery_photo", id, fields)
	writeJSON(w, http.StatusOK, map[string]any{"status": true})
}

func (h *Handlers) deletePhoto(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	if err := h.repo.DeletePhoto(r.Context(), id); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	actor := principalFromContext(r)
	_ = h.repo.InsertAuditLog(r.Context(), actor.UserID, "gallery_photo.delete", "gallery_photo", id, nil)
	writeJSON(w, http.StatusOK, map[string]any{"status": true})
}
