package admin

import (
	"strings"

	"hubnegocios/backend/internal/sanitize"
)

func stringValue(value any) string {
	if value == nil {
		return ""
	}
	if text, ok := value.(string); ok {
		return strings.TrimSpace(text)
	}
	return ""
}

func sanitizeHTML(raw string) string {
	return sanitize.SanitizeHTML(raw)
}
