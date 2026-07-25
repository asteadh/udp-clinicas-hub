package storage

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"strconv"
	"time"
)

// SignPath produces an HMAC-SHA256 signature over path+expires using secret.
func SignPath(path string, ttl time.Duration, secret string) (signature string, expires int64) {
	expires = time.Now().Add(ttl).Unix()
	return signPath(path, expires, secret), expires
}

func signPath(path string, expires int64, secret string) string {
	mac := hmac.New(sha256.New, []byte(secret))
	mac.Write([]byte(path))
	mac.Write([]byte(":"))
	mac.Write([]byte(strconv.FormatInt(expires, 10)))
	return hex.EncodeToString(mac.Sum(nil))
}

// VerifySignedPath checks that sig/expires were produced by SignPath for path
// and that expires has not yet passed.
func VerifySignedPath(path string, sig string, expires int64, secret string) error {
	if time.Now().Unix() > expires {
		return fmt.Errorf("signed url expired")
	}
	expected := signPath(path, expires, secret)
	if !hmac.Equal([]byte(expected), []byte(sig)) {
		return fmt.Errorf("invalid signature")
	}
	return nil
}
