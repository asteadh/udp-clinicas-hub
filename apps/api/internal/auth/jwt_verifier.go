package auth

import (
	"context"
	"crypto"
	"crypto/rsa"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"math/big"
	"net/http"
	"strings"
	"sync"
	"time"
)

type jwtVerifyOptions struct {
	Audiences []string
	Issuers   []string
	JWKSURL   string
}

type jwksVerifier struct {
	client *http.Client
	mu     sync.Mutex
	cache  map[string]jwkKey
}

type jwkKey struct {
	Alg string `json:"alg"`
	E   string `json:"e"`
	Kid string `json:"kid"`
	Kty string `json:"kty"`
	N   string `json:"n"`
	Use string `json:"use"`
}

type jwksResponse struct {
	Keys []jwkKey `json:"keys"`
}

func newJWKSVerifier(client *http.Client) *jwksVerifier {
	return &jwksVerifier{client: client, cache: map[string]jwkKey{}}
}

func (v *jwksVerifier) Verify(ctx context.Context, token string, opts jwtVerifyOptions) (map[string]any, error) {
	token = strings.TrimSpace(token)
	if token == "" {
		return nil, errors.New("id token is required")
	}
	parts := strings.Split(token, ".")
	if len(parts) != 3 {
		return nil, errors.New("invalid id token")
	}
	header, err := decodeJWTPart(parts[0])
	if err != nil {
		return nil, err
	}
	var head struct {
		Alg string `json:"alg"`
		Kid string `json:"kid"`
	}
	if err := json.Unmarshal(header, &head); err != nil {
		return nil, err
	}
	if head.Alg != "RS256" || head.Kid == "" {
		return nil, errors.New("unsupported id token signature")
	}
	key, err := v.key(ctx, opts.JWKSURL, head.Kid)
	if err != nil {
		return nil, err
	}
	publicKey, err := key.rsaPublicKey()
	if err != nil {
		return nil, err
	}
	unsigned := parts[0] + "." + parts[1]
	signature, err := base64.RawURLEncoding.DecodeString(parts[2])
	if err != nil {
		return nil, errors.New("invalid id token signature")
	}
	digest := sha256.Sum256([]byte(unsigned))
	if err := rsa.VerifyPKCS1v15(publicKey, crypto.SHA256, digest[:], signature); err != nil {
		return nil, errors.New("invalid id token signature")
	}
	payload, err := decodeJWTPart(parts[1])
	if err != nil {
		return nil, err
	}
	var claims map[string]any
	if err := json.Unmarshal(payload, &claims); err != nil {
		return nil, err
	}
	if !claimMatches(claims["iss"], opts.Issuers) {
		return nil, errors.New("invalid id token issuer")
	}
	if !audienceMatches(claims["aud"], opts.Audiences) {
		return nil, errors.New("invalid id token audience")
	}
	if exp, ok := numberClaim(claims["exp"]); !ok || time.Now().Unix() >= exp {
		return nil, errors.New("id token is expired")
	}
	return claims, nil
}

func (v *jwksVerifier) key(ctx context.Context, url string, kid string) (jwkKey, error) {
	v.mu.Lock()
	if key, ok := v.cache[kid]; ok {
		v.mu.Unlock()
		return key, nil
	}
	v.mu.Unlock()

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return jwkKey{}, err
	}
	resp, err := v.client.Do(req)
	if err != nil {
		return jwkKey{}, err
	}
	defer resp.Body.Close()
	if resp.StatusCode >= 300 {
		return jwkKey{}, fmt.Errorf("jwks status %d", resp.StatusCode)
	}
	var payload jwksResponse
	if err := json.NewDecoder(resp.Body).Decode(&payload); err != nil {
		return jwkKey{}, err
	}
	v.mu.Lock()
	defer v.mu.Unlock()
	for _, key := range payload.Keys {
		v.cache[key.Kid] = key
	}
	if key, ok := v.cache[kid]; ok {
		return key, nil
	}
	return jwkKey{}, errors.New("id token key not found")
}

func (key jwkKey) rsaPublicKey() (*rsa.PublicKey, error) {
	if key.Kty != "RSA" {
		return nil, errors.New("unsupported jwk key type")
	}
	modulus, err := base64.RawURLEncoding.DecodeString(key.N)
	if err != nil {
		return nil, err
	}
	exponent, err := base64.RawURLEncoding.DecodeString(key.E)
	if err != nil {
		return nil, err
	}
	e := 0
	for _, b := range exponent {
		e = e<<8 + int(b)
	}
	return &rsa.PublicKey{N: new(big.Int).SetBytes(modulus), E: e}, nil
}

func decodeJWTPart(value string) ([]byte, error) {
	raw, err := base64.RawURLEncoding.DecodeString(value)
	if err != nil {
		return nil, errors.New("invalid id token")
	}
	return raw, nil
}

func claimMatches(value any, allowed []string) bool {
	text, _ := value.(string)
	for _, item := range allowed {
		if strings.TrimSpace(item) == text && text != "" {
			return true
		}
	}
	return false
}

func audienceMatches(value any, allowed []string) bool {
	switch typed := value.(type) {
	case string:
		return claimMatches(typed, allowed)
	case []any:
		for _, item := range typed {
			if claimMatches(item, allowed) {
				return true
			}
		}
	}
	return false
}

func numberClaim(value any) (int64, bool) {
	switch typed := value.(type) {
	case float64:
		return int64(typed), true
	case json.Number:
		value, err := typed.Int64()
		return value, err == nil
	}
	return 0, false
}
