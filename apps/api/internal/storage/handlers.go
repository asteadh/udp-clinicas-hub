package storage

import (
	"context"
	"fmt"
	"io"
	"mime"
	"net/http"
	"net/url"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"hubnegocios/backend/internal/apiutil"
)

// Authenticator resolves the caller from the Bearer token.
type Authenticator interface {
	UserFromBearer(ctx context.Context, authorization string) (map[string]any, error)
}

type Handlers struct {
	apiBaseURL string
	service    *Service
	signSecret string
	auth       Authenticator
}

func NewHandlers(service *Service, signSecret string, apiBaseURL string, auth Authenticator) *Handlers {
	return &Handlers{apiBaseURL: strings.TrimRight(apiBaseURL, "/"), service: service, signSecret: signSecret, auth: auth}
}

func (h *Handlers) Register(mux *http.ServeMux) {
	mux.HandleFunc("POST /api/storage/upload", h.requireUser(h.upload))
	mux.HandleFunc("GET /api/storage/download", h.download)
	mux.HandleFunc("GET /api/storage/signed-url", h.requireUser(h.signedURL))
}

// publicFolders may be downloaded without a signature — they only ever hold
// content already exposed on public pages (clinic/team/gallery/article
// images). Everything else (the "uploads/" catch-all) requires a valid sig.
var publicFolders = []string{"clinics/", "team/", "gallery/", "articles/"}

func isPublicPath(p string) bool {
	for _, prefix := range publicFolders {
		if strings.HasPrefix(p, prefix) {
			return true
		}
	}
	return false
}

func (h *Handlers) requireUser(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if h.auth == nil {
			apiutil.WriteError(w, http.StatusUnauthorized, "authentication required")
			return
		}
		user, err := h.auth.UserFromBearer(r.Context(), r.Header.Get("Authorization"))
		if err != nil {
			apiutil.WriteError(w, http.StatusUnauthorized, "authentication required")
			return
		}
		hasID := false
		for _, key := range []string{"id", "uid"} {
			if value, ok := user[key].(string); ok && strings.TrimSpace(value) != "" {
				hasID = true
				break
			}
		}
		if !hasID {
			apiutil.WriteError(w, http.StatusUnauthorized, "authentication required")
			return
		}
		next(w, r)
	}
}

func (h *Handlers) upload(w http.ResponseWriter, r *http.Request) {
	if err := r.ParseMultipartForm(32 << 20); err != nil {
		apiutil.WriteError(w, http.StatusBadRequest, err.Error())
		return
	}
	file, header, err := r.FormFile("file")
	if err != nil {
		apiutil.WriteError(w, http.StatusBadRequest, err.Error())
		return
	}
	defer file.Close()

	folder := cleanPath(r.FormValue("folder"))
	if folder == "" {
		folder = "uploads"
	}
	name := filepath.Base(header.Filename)
	contentType := header.Header.Get("Content-Type")
	if contentType == "" {
		contentType = "application/octet-stream"
	}
	path, err := h.service.Upload(r.Context(), folder, name, file, header.Size, contentType)
	if err != nil {
		apiutil.WriteError(w, http.StatusBadRequest, err.Error())
		return
	}
	apiutil.WriteJSON(w, http.StatusCreated, map[string]any{
		"path": path,
		"url":  h.resolveURL(path),
	})
}

func (h *Handlers) download(w http.ResponseWriter, r *http.Request) {
	path := cleanPath(r.URL.Query().Get("path"))
	if !isPublicPath(path) {
		expires, err := strconv.ParseInt(r.URL.Query().Get("expires"), 10, 64)
		if err != nil {
			apiutil.WriteError(w, http.StatusUnauthorized, "invalid expires value")
			return
		}
		if err := VerifySignedPath(path, r.URL.Query().Get("sig"), expires, h.signSecret); err != nil {
			apiutil.WriteError(w, http.StatusUnauthorized, err.Error())
			return
		}
	}
	object, err := h.service.Get(r.Context(), path)
	if err != nil {
		apiutil.WriteError(w, http.StatusNotFound, err.Error())
		return
	}
	defer object.Close()
	if contentType := mime.TypeByExtension(filepath.Ext(path)); contentType != "" {
		w.Header().Set("Content-Type", contentType)
	}
	if _, err := io.Copy(w, object); err != nil {
		apiutil.WriteError(w, http.StatusInternalServerError, err.Error())
		return
	}
}

func (h *Handlers) signedURL(w http.ResponseWriter, r *http.Request) {
	path := cleanPath(r.URL.Query().Get("path"))
	if path == "" {
		apiutil.WriteError(w, http.StatusBadRequest, "path is required")
		return
	}
	apiutil.WriteJSON(w, http.StatusOK, map[string]any{
		"path": path,
		"url":  h.resolveURL(path),
	})
}

// resolveURL returns a browser-usable URL: unsigned for public folders,
// HMAC-signed (1h TTL) for everything else.
func (h *Handlers) resolveURL(path string) string {
	if isPublicPath(path) {
		return fmt.Sprintf("%s/api/storage/download?path=%s", h.apiBaseURL, url.QueryEscape(path))
	}
	sig, expires := SignPath(path, time.Hour, h.signSecret)
	return fmt.Sprintf("%s/api/storage/download?path=%s&expires=%d&sig=%s",
		h.apiBaseURL, url.QueryEscape(path), expires, sig)
}
