package httplog

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"strings"
)

type contextKey struct{}

type Data struct {
	AuthEmailHash string
	AuthProvider  string
	ErrorCode     string
	RequestID     string
}

func WithData(ctx context.Context, data *Data) context.Context {
	return context.WithValue(ctx, contextKey{}, data)
}

func FromContext(ctx context.Context) *Data {
	data, _ := ctx.Value(contextKey{}).(*Data)
	return data
}

func SetAuthEmail(ctx context.Context, email string) {
	if data := FromContext(ctx); data != nil {
		data.AuthEmailHash = HashEmail(email)
	}
}

func SetAuthProvider(ctx context.Context, provider string) {
	if data := FromContext(ctx); data != nil {
		data.AuthProvider = strings.ToLower(strings.TrimSpace(provider))
	}
}

func SetErrorCode(ctx context.Context, code string) {
	if data := FromContext(ctx); data != nil {
		data.ErrorCode = strings.TrimSpace(code)
	}
}

func HashEmail(email string) string {
	email = strings.ToLower(strings.TrimSpace(email))
	if email == "" {
		return ""
	}
	sum := sha256.Sum256([]byte(email))
	return hex.EncodeToString(sum[:8])
}
