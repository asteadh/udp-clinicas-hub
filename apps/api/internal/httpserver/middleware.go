package httpserver

import (
	"crypto/rand"
	"encoding/hex"
	"log"
	"net/http"
	"strings"
	"time"

	"hubnegocios/backend/internal/httplog"
)

// withCORS allows requests from the configured origins (empty list disables
// CORS entirely, which is fine for same-origin/server-to-server use).
func withCORS(allowedOrigins []string, next http.Handler) http.Handler {
	allowed := make(map[string]bool, len(allowedOrigins))
	for _, origin := range allowedOrigins {
		allowed[strings.TrimSpace(origin)] = true
	}
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		origin := r.Header.Get("Origin")
		if origin != "" && allowed[origin] {
			w.Header().Set("Access-Control-Allow-Origin", origin)
			w.Header().Set("Vary", "Origin")
			w.Header().Set("Access-Control-Allow-Credentials", "true")
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Authorization, Content-Type")
		}
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}

// withRequestID attaches a per-request httplog.Data (carrying a generated
// request id) to the request context, so downstream handlers can annotate it
// via httplog.SetAuthEmail/SetAuthProvider/SetErrorCode.
func withRequestID(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		requestID := newRequestID()
		w.Header().Set("X-Request-Id", requestID)
		data := &httplog.Data{RequestID: requestID}
		ctx := httplog.WithData(r.Context(), data)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

// withLogging logs one line per request after it completes, including any
// auth/error annotations handlers attached via the httplog package.
func withLogging(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		recorder := &statusRecorder{ResponseWriter: w, status: http.StatusOK}
		next.ServeHTTP(recorder, r)
		duration := time.Since(start)

		data := httplog.FromContext(r.Context())
		requestID, authProvider, authEmailHash, errorCode := "", "", "", ""
		if data != nil {
			requestID = data.RequestID
			authProvider = data.AuthProvider
			authEmailHash = data.AuthEmailHash
			errorCode = data.ErrorCode
		}

		log.Printf(
			"request_id=%s method=%s path=%s status=%d duration_ms=%d auth_provider=%s auth_email_hash=%s error_code=%s",
			requestID, r.Method, r.URL.Path, recorder.status, duration.Milliseconds(), authProvider, authEmailHash, errorCode,
		)
	})
}

type statusRecorder struct {
	http.ResponseWriter
	status int
}

func (rec *statusRecorder) WriteHeader(status int) {
	rec.status = status
	rec.ResponseWriter.WriteHeader(status)
}

func newRequestID() string {
	data := make([]byte, 8)
	if _, err := rand.Read(data); err != nil {
		return "unknown"
	}
	return hex.EncodeToString(data)
}
