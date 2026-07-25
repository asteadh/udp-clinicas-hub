package apiutil

import (
	"encoding/json"
	"net/http"

	"hubnegocios/backend/internal/httplog"
)

func ReadJSON(r *http.Request, target any) error {
	defer r.Body.Close()
	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()
	return decoder.Decode(target)
}

func WriteJSON(w http.ResponseWriter, status int, payload any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	if payload != nil {
		_ = json.NewEncoder(w).Encode(payload)
	}
}

func WriteError(w http.ResponseWriter, status int, message string) {
	WriteJSON(w, status, map[string]any{"error": message})
}

func WriteCodedError(w http.ResponseWriter, r *http.Request, status int, code string, message string) {
	httplog.SetErrorCode(r.Context(), code)
	WriteJSON(w, status, map[string]any{"code": code, "error": message})
}
