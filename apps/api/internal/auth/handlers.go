package auth

import (
	"net/http"

	"hubnegocios/backend/internal/apiutil"
	"hubnegocios/backend/internal/httplog"
)

type Handlers struct {
	service  *Service
	verifier OAuthVerifier
}

func NewHandlers(service *Service, verifier OAuthVerifier) *Handlers {
	return &Handlers{service: service, verifier: verifier}
}

func (h *Handlers) Register(mux *http.ServeMux) {
	// Break-glass login for the emergency superadmin created by cmd/seed.
	// Every other account signs in via Google OAuth or a passkey.
	mux.HandleFunc("POST /api/auth/login", h.login)
	mux.HandleFunc("POST /api/auth/oauth/google", h.oauth("google"))
	mux.HandleFunc("GET /api/auth/identities", h.identities)
	mux.HandleFunc("POST /api/auth/oauth/google/link", h.oauthLink("google"))
	mux.HandleFunc("DELETE /api/auth/identities/{provider}/{providerUserId}", h.unlinkIdentity)
	mux.HandleFunc("DELETE /api/auth/passkeys/{id}", h.deletePasskey)
	mux.HandleFunc("POST /api/auth/refresh", h.refresh)
	mux.HandleFunc("POST /api/auth/logout", h.ok)
	mux.HandleFunc("GET /api/me", h.me)
}

type credentialsRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

func (h *Handlers) login(w http.ResponseWriter, r *http.Request) {
	var body credentialsRequest
	if err := apiutil.ReadJSON(r, &body); err != nil {
		apiutil.WriteCodedError(w, r, http.StatusBadRequest, "invalid-request", err.Error())
		return
	}
	httplog.SetAuthEmail(r.Context(), body.Email)
	httplog.SetAuthProvider(r.Context(), "password")
	session, err := h.service.Login(r.Context(), body.Email, body.Password)
	if err != nil {
		apiutil.WriteCodedError(w, r, http.StatusUnauthorized, "invalid-credentials", err.Error())
		return
	}
	apiutil.WriteJSON(w, http.StatusOK, session)
}

func (h *Handlers) oauth(provider string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var body oauthRequest
		if err := apiutil.ReadJSON(r, &body); err != nil {
			apiutil.WriteCodedError(w, r, http.StatusBadRequest, "invalid-request", err.Error())
			return
		}
		httplog.SetAuthEmail(r.Context(), body.Email)
		httplog.SetAuthProvider(r.Context(), provider)
		profile := OAuthProfile{
			Email:          body.Email,
			FirstName:      body.FirstName,
			ImageURL:       body.ImageURL,
			LastName:       body.LastName,
			ProviderUserID: body.ProviderUserID,
		}
		var err error
		if h.verifier != nil {
			profile, err = h.verifier.VerifyOAuth(r.Context(), provider, body)
			if err != nil {
				apiutil.WriteCodedError(w, r, http.StatusUnauthorized, oauthErrorCode(err), err.Error())
				return
			}
			httplog.SetAuthEmail(r.Context(), profile.Email)
		}
		session, err := h.service.OAuth(r.Context(), provider, profile.ProviderUserID, profile.Email, profile.FirstName, profile.LastName, profile.ImageURL)
		if err != nil {
			apiutil.WriteCodedError(w, r, http.StatusBadRequest, authErrorCode(err), err.Error())
			return
		}
		apiutil.WriteJSON(w, http.StatusOK, session)
	}
}

func (h *Handlers) refresh(w http.ResponseWriter, r *http.Request) {
	user, err := h.service.UserFromBearer(r.Context(), r.Header.Get("Authorization"))
	if err != nil {
		apiutil.WriteError(w, http.StatusUnauthorized, err.Error())
		return
	}
	session, err := h.service.sessionForUser(r.Context(), stringValue(user["id"]))
	if err != nil {
		apiutil.WriteError(w, http.StatusUnauthorized, err.Error())
		return
	}
	apiutil.WriteJSON(w, http.StatusOK, session)
}

func (h *Handlers) me(w http.ResponseWriter, r *http.Request) {
	user, err := h.service.UserFromBearer(r.Context(), r.Header.Get("Authorization"))
	if err != nil {
		apiutil.WriteError(w, http.StatusUnauthorized, err.Error())
		return
	}
	apiutil.WriteJSON(w, http.StatusOK, user)
}

func (h *Handlers) ok(w http.ResponseWriter, r *http.Request) {
	apiutil.WriteJSON(w, http.StatusOK, map[string]any{"status": true})
}

type oauthRequest = OAuthPayload

func authErrorCode(err error) string {
	if err == nil {
		return ""
	}
	switch err.Error() {
	case "provider and provider user id are required":
		return "invalid-provider-profile"
	default:
		return "auth-failed"
	}
}

func oauthErrorCode(err error) string {
	if err == nil {
		return ""
	}
	if err.Error() == "google sign in is not configured" {
		return "provider-not-configured"
	}
	return "invalid-provider-token"
}
