package intake

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
	mux.HandleFunc("POST /api/intake", h.submit)
}

type submitRequest struct {
	ClinicSlug       string `json:"clinicSlug"`
	FullName         string `json:"fullName"`
	Rut              string `json:"rut"`
	Email            string `json:"email"`
	Phone            string `json:"phone"`
	CaseType         string `json:"caseType"`
	CaseDescription  string `json:"caseDescription"`
	HasDocumentation string `json:"hasDocumentation"`
}

func (h *Handlers) submit(w http.ResponseWriter, r *http.Request) {
	var body submitRequest
	if err := apiutil.ReadJSON(r, &body); err != nil {
		apiutil.WriteError(w, http.StatusBadRequest, err.Error())
		return
	}
	body.ClinicSlug = strings.TrimSpace(body.ClinicSlug)
	body.FullName = strings.TrimSpace(body.FullName)
	body.Rut = strings.TrimSpace(body.Rut)
	body.Email = strings.TrimSpace(body.Email)
	body.CaseDescription = strings.TrimSpace(body.CaseDescription)
	if body.ClinicSlug == "" || body.FullName == "" || body.Rut == "" || body.Email == "" || body.CaseDescription == "" {
		apiutil.WriteError(w, http.StatusBadRequest, "clinicSlug, fullName, rut, email and caseDescription are required")
		return
	}
	id, err := h.repo.Insert(r.Context(), body.ClinicSlug, body.FullName, body.Rut, body.Email, body.Phone, body.CaseType, body.CaseDescription, body.HasDocumentation)
	if err != nil {
		apiutil.WriteError(w, http.StatusBadRequest, err.Error())
		return
	}
	apiutil.WriteJSON(w, http.StatusCreated, map[string]any{"id": id})
}
