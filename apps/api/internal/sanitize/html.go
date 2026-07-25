package sanitize

import "github.com/microcosm-cc/bluemonday"

var policy = bluemonday.UGCPolicy()

// SanitizeHTML strips disallowed tags/attributes from user-authored HTML
// (FAQ answers, article bodies, bios) before it is persisted.
func SanitizeHTML(raw string) string {
	return policy.Sanitize(raw)
}
