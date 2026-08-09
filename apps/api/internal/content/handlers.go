package content

import (
	"errors"
	"net/http"
	"strconv"

	"hubnegocios/backend/internal/apiutil"
)

type Handlers struct {
	repo *Repository
}

func NewHandlers(repo *Repository) *Handlers {
	return &Handlers{repo: repo}
}

func (h *Handlers) Register(mux *http.ServeMux) {
	mux.HandleFunc("GET /api/clinics", h.clinics)
	mux.HandleFunc("GET /api/clinics/{slug}", h.clinic)
	mux.HandleFunc("GET /api/clinics/{slug}/faqs", h.faqs)
	mux.HandleFunc("GET /api/clinics/{slug}/articles", h.clinicArticles)
	mux.HandleFunc("GET /api/articles", h.articles)
	mux.HandleFunc("GET /api/articles/featured", h.featuredArticle)
	mux.HandleFunc("GET /api/articles/{slug}", h.article)
	mux.HandleFunc("GET /api/clinics/{slug}/gallery", h.gallery)
	mux.HandleFunc("GET /api/gallery/albums/{id}", h.galleryAlbum)
	mux.HandleFunc("GET /api/clinics/{slug}/team", h.team)
	mux.HandleFunc("GET /api/settings/public", h.publicSettings)
}

func (h *Handlers) clinics(w http.ResponseWriter, r *http.Request) {
	values, err := h.repo.ListClinics(r.Context())
	if err != nil {
		apiutil.WriteError(w, http.StatusInternalServerError, err.Error())
		return
	}
	apiutil.WriteJSON(w, http.StatusOK, map[string]any{"clinics": values})
}

func (h *Handlers) clinic(w http.ResponseWriter, r *http.Request) {
	value, err := h.repo.GetClinicBySlug(r.Context(), r.PathValue("slug"))
	if err != nil {
		writeNotFoundable(w, err)
		return
	}
	apiutil.WriteJSON(w, http.StatusOK, map[string]any{"clinic": value})
}

func (h *Handlers) faqs(w http.ResponseWriter, r *http.Request) {
	values, err := h.repo.ListFaqsByClinic(r.Context(), r.PathValue("slug"))
	if err != nil {
		apiutil.WriteError(w, http.StatusInternalServerError, err.Error())
		return
	}
	apiutil.WriteJSON(w, http.StatusOK, map[string]any{"faqs": values})
}

func (h *Handlers) clinicArticles(w http.ResponseWriter, r *http.Request) {
	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	values, err := h.repo.ListArticles(r.Context(), r.PathValue("slug"), page)
	if err != nil {
		apiutil.WriteError(w, http.StatusInternalServerError, err.Error())
		return
	}
	apiutil.WriteJSON(w, http.StatusOK, map[string]any{"articles": values})
}

func (h *Handlers) articles(w http.ResponseWriter, r *http.Request) {
	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	values, err := h.repo.ListArticles(r.Context(), "", page)
	if err != nil {
		apiutil.WriteError(w, http.StatusInternalServerError, err.Error())
		return
	}
	apiutil.WriteJSON(w, http.StatusOK, map[string]any{"articles": values})
}

// La ruta va declarada antes que /api/articles/{slug} para que "featured" no se
// interprete como el slug de una columna.
func (h *Handlers) featuredArticle(w http.ResponseWriter, r *http.Request) {
	value, err := h.repo.GetFeaturedArticle(r.Context())
	if err != nil {
		writeNotFoundable(w, err)
		return
	}
	apiutil.WriteJSON(w, http.StatusOK, map[string]any{"article": value})
}

func (h *Handlers) article(w http.ResponseWriter, r *http.Request) {
	value, err := h.repo.GetArticleBySlugAny(r.Context(), r.PathValue("slug"))
	if err != nil {
		writeNotFoundable(w, err)
		return
	}
	apiutil.WriteJSON(w, http.StatusOK, map[string]any{"article": value})
}

func (h *Handlers) gallery(w http.ResponseWriter, r *http.Request) {
	values, err := h.repo.ListGalleryAlbumsByClinic(r.Context(), r.PathValue("slug"))
	if err != nil {
		apiutil.WriteError(w, http.StatusInternalServerError, err.Error())
		return
	}
	apiutil.WriteJSON(w, http.StatusOK, map[string]any{"albums": values})
}

func (h *Handlers) galleryAlbum(w http.ResponseWriter, r *http.Request) {
	value, err := h.repo.GetGalleryAlbum(r.Context(), r.PathValue("id"))
	if err != nil {
		writeNotFoundable(w, err)
		return
	}
	apiutil.WriteJSON(w, http.StatusOK, map[string]any{"album": value})
}

func (h *Handlers) team(w http.ResponseWriter, r *http.Request) {
	values, err := h.repo.ListTeamByClinic(r.Context(), r.PathValue("slug"))
	if err != nil {
		apiutil.WriteError(w, http.StatusInternalServerError, err.Error())
		return
	}
	apiutil.WriteJSON(w, http.StatusOK, map[string]any{"team": values})
}

func (h *Handlers) publicSettings(w http.ResponseWriter, r *http.Request) {
	values, err := h.repo.GetPublicSettings(r.Context())
	if err != nil {
		apiutil.WriteError(w, http.StatusInternalServerError, err.Error())
		return
	}
	apiutil.WriteJSON(w, http.StatusOK, map[string]any{"settings": values})
}

func writeNotFoundable(w http.ResponseWriter, err error) {
	if errors.Is(err, ErrNotFound) {
		apiutil.WriteError(w, http.StatusNotFound, "not found")
		return
	}
	apiutil.WriteError(w, http.StatusInternalServerError, err.Error())
}
