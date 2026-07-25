package admin

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http"
)

func readJSON(r *http.Request, target any) error {
	defer r.Body.Close()
	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()
	return decoder.Decode(target)
}

// readJSONPeek decodes the request body into target without consuming it —
// r.Body is restored afterward so a later readJSON call (in the real
// handler) can still read the full payload. Used by clinicOf resolvers that
// need a body field (e.g. clinicSlug) before the handler itself runs.
func readJSONPeek(r *http.Request, target any) error {
	raw, err := io.ReadAll(r.Body)
	r.Body.Close()
	r.Body = io.NopCloser(bytes.NewReader(raw))
	if err != nil {
		return err
	}
	if len(raw) == 0 {
		return nil
	}
	return json.Unmarshal(raw, target)
}

func writeJSON(w http.ResponseWriter, status int, payload any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	if payload != nil {
		_ = json.NewEncoder(w).Encode(payload)
	}
}

func writeError(w http.ResponseWriter, status int, message string) {
	writeJSON(w, status, map[string]any{"error": message})
}
