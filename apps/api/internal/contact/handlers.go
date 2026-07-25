package contact

import (
	"net/http"
	"strings"

	"hubnegocios/backend/internal/apiutil"
)

type Handlers struct {
	repo *Repository
}

func NewHandlers(repo *Repository) *Handlers {
	return &Handlers{repo: repo}
}

func (h *Handlers) Register(mux *http.ServeMux) {
	mux.HandleFunc("POST /api/contact", h.submit)
}

type submitRequest struct {
	ClinicSlug string         `json:"clinicSlug"`
	Name       string         `json:"name"`
	Email      string         `json:"email"`
	Phone      string         `json:"phone"`
	Message    string         `json:"message"`
	Metadata   map[string]any `json:"metadata"`
}

func (h *Handlers) submit(w http.ResponseWriter, r *http.Request) {
	var body submitRequest
	if err := apiutil.ReadJSON(r, &body); err != nil {
		apiutil.WriteError(w, http.StatusBadRequest, err.Error())
		return
	}
	body.ClinicSlug = strings.TrimSpace(body.ClinicSlug)
	body.Name = strings.TrimSpace(body.Name)
	body.Email = strings.TrimSpace(body.Email)
	body.Message = strings.TrimSpace(body.Message)
	if body.ClinicSlug == "" || body.Name == "" || body.Email == "" || body.Message == "" {
		apiutil.WriteError(w, http.StatusBadRequest, "clinicSlug, name, email and message are required")
		return
	}
	id, err := h.repo.Insert(r.Context(), body.ClinicSlug, body.Name, body.Email, body.Phone, body.Message, "web", body.Metadata)
	if err != nil {
		apiutil.WriteError(w, http.StatusBadRequest, err.Error())
		return
	}
	apiutil.WriteJSON(w, http.StatusCreated, map[string]any{"id": id})
}
