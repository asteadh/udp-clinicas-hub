package httpserver

import (
	"net/http"

	"hubnegocios/backend/internal/apiutil"
)

// health always returns 200 once the process is up (liveness).
func (a *App) health(w http.ResponseWriter, r *http.Request) {
	apiutil.WriteJSON(w, http.StatusOK, map[string]any{"status": "ok"})
}

// ready pings the database and returns 503 if it is unreachable (readiness).
func (a *App) ready(w http.ResponseWriter, r *http.Request) {
	if err := a.db.Ping(r.Context()); err != nil {
		apiutil.WriteJSON(w, http.StatusServiceUnavailable, map[string]any{"status": "unavailable", "error": err.Error()})
		return
	}
	apiutil.WriteJSON(w, http.StatusOK, map[string]any{"status": "ok"})
}
