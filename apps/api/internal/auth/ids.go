package auth

import (
	"crypto/rand"
	"encoding/hex"
)

// NewID returns a random opaque identifier prefixed for readability, e.g.
// "usr_...", matching the id format already used by DB-generated ids
// (migrations use the same "prefix_hex" shape via gen_random_bytes).
func NewID(prefix string) (string, error) {
	data := make([]byte, 16)
	if _, err := rand.Read(data); err != nil {
		return "", err
	}
	return prefix + "_" + hex.EncodeToString(data), nil
}
