package httpserver

import "net/http"

// Router assembles the full HTTP surface: health/readiness, auth (password,
// Google OAuth, passkeys, identities), admin (admin-user + clinic-scoped
// content CRUD), and the public content/contact/storage APIs.
func (a *App) Router() http.Handler {
	mux := http.NewServeMux()

	mux.HandleFunc("GET /health", a.health)
	mux.HandleFunc("GET /ready", a.ready)

	a.authHandlers.Register(mux)
	a.passkeyHandlers.Register(mux)
	a.adminHandlers.Register(mux)
	a.contentHandlers.Register(mux)
	a.contactHandlers.Register(mux)
	a.storageHandlers.Register(mux)

	var handler http.Handler = mux
	handler = withLogging(handler)
	handler = withCORS(a.cfg.AllowedOrigins, handler)
	handler = withRequestID(handler)
	return handler
}
