package auth

import (
	"encoding/json"
	"net/http"
	"strings"

	"hubnegocios/backend/internal/apiutil"
	"hubnegocios/backend/internal/httplog"
)

// PasskeyHandlers exposes the WebAuthn ceremony endpoints.
type PasskeyHandlers struct {
	auth    *Service
	passkey *PasskeyService
}

func NewPasskeyHandlers(authSvc *Service, passkey *PasskeyService) *PasskeyHandlers {
	return &PasskeyHandlers{auth: authSvc, passkey: passkey}
}

func (h *PasskeyHandlers) Register(mux *http.ServeMux) {
	mux.HandleFunc("POST /api/auth/passkey/register/begin", h.registerBegin)
	mux.HandleFunc("POST /api/auth/passkey/register/finish", h.registerFinish)
	mux.HandleFunc("POST /api/auth/passkey/login/begin", h.loginBegin)
	mux.HandleFunc("POST /api/auth/passkey/login/discoverable/begin", h.loginDiscoverableBegin)
	mux.HandleFunc("POST /api/auth/passkey/login/finish", h.loginFinish)
}

func (h *PasskeyHandlers) userID(r *http.Request) (string, bool) {
	user, err := h.auth.UserFromBearer(r.Context(), r.Header.Get("Authorization"))
	if err != nil {
		return "", false
	}
	id := stringValue(user["id"])
	return id, id != ""
}

func (h *PasskeyHandlers) registerBegin(w http.ResponseWriter, r *http.Request) {
	httplog.SetAuthProvider(r.Context(), "passkey")
	userID, ok := h.userID(r)
	if !ok {
		apiutil.WriteError(w, http.StatusUnauthorized, "authentication required")
		return
	}
	options, err := h.passkey.BeginRegistration(r.Context(), userID)
	if err != nil {
		apiutil.WriteError(w, http.StatusBadRequest, err.Error())
		return
	}
	apiutil.WriteJSON(w, http.StatusOK, options)
}

type passkeyFinishRequest struct {
	SessionID string          `json:"sessionId"`
	Label     string          `json:"label"`
	Response  json.RawMessage `json:"response"`
}

func (h *PasskeyHandlers) registerFinish(w http.ResponseWriter, r *http.Request) {
	httplog.SetAuthProvider(r.Context(), "passkey")
	userID, ok := h.userID(r)
	if !ok {
		apiutil.WriteError(w, http.StatusUnauthorized, "authentication required")
		return
	}
	var body passkeyFinishRequest
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		apiutil.WriteError(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if strings.TrimSpace(body.SessionID) == "" || len(body.Response) == 0 {
		apiutil.WriteError(w, http.StatusBadRequest, "sessionId and response are required")
		return
	}
	if err := h.passkey.FinishRegistration(r.Context(), userID, body.SessionID, body.Response, body.Label); err != nil {
		apiutil.WriteError(w, http.StatusBadRequest, err.Error())
		return
	}
	apiutil.WriteJSON(w, http.StatusOK, map[string]any{"status": "ok"})
}

type passkeyLoginBeginRequest struct {
	Email string `json:"email"`
}

func (h *PasskeyHandlers) loginBegin(w http.ResponseWriter, r *http.Request) {
	httplog.SetAuthProvider(r.Context(), "passkey")
	var body passkeyLoginBeginRequest
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		apiutil.WriteError(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if strings.TrimSpace(body.Email) == "" {
		apiutil.WriteError(w, http.StatusBadRequest, "email is required")
		return
	}
	options, err := h.passkey.BeginLogin(r.Context(), body.Email)
	if err != nil {
		apiutil.WriteError(w, http.StatusBadRequest, err.Error())
		return
	}
	apiutil.WriteJSON(w, http.StatusOK, options)
}

func (h *PasskeyHandlers) loginDiscoverableBegin(w http.ResponseWriter, r *http.Request) {
	httplog.SetAuthProvider(r.Context(), "passkey")
	options, err := h.passkey.BeginDiscoverableLogin(r.Context())
	if err != nil {
		apiutil.WriteError(w, http.StatusBadRequest, err.Error())
		return
	}
	apiutil.WriteJSON(w, http.StatusOK, options)
}

func (h *PasskeyHandlers) loginFinish(w http.ResponseWriter, r *http.Request) {
	httplog.SetAuthProvider(r.Context(), "passkey")
	var body passkeyFinishRequest
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		apiutil.WriteError(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if strings.TrimSpace(body.SessionID) == "" || len(body.Response) == 0 {
		apiutil.WriteError(w, http.StatusBadRequest, "sessionId and response are required")
		return
	}
	session, err := h.passkey.FinishLogin(r.Context(), body.SessionID, body.Response)
	if err != nil {
		apiutil.WriteError(w, http.StatusUnauthorized, err.Error())
		return
	}
	apiutil.WriteJSON(w, http.StatusOK, session)
}
