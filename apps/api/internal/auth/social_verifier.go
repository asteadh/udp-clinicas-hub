package auth

import (
	"context"
	"errors"
	"net/http"
	"strings"
	"time"

	"hubnegocios/backend/internal/config"
)

// SocialVerifier only supports Google — this project restricts sign-in to
// @udp.cl Google Workspace accounts, unlike Gremia which also offers
// Facebook/Apple.
type SocialVerifier struct {
	googleAudiences []string
	googleJWKSURL   string
	jwks            *jwksVerifier
}

const googleJWKSURL = "https://www.googleapis.com/oauth2/v3/certs"

func NewSocialVerifier(cfg *config.Config) *SocialVerifier {
	client := &http.Client{Timeout: 15 * time.Second}
	return &SocialVerifier{
		googleAudiences: cfg.GoogleAllowedClientIDs,
		googleJWKSURL:   googleJWKSURL,
		jwks:            newJWKSVerifier(client),
	}
}

func (v *SocialVerifier) VerifyOAuth(ctx context.Context, provider string, payload OAuthPayload) (OAuthProfile, error) {
	if strings.ToLower(strings.TrimSpace(provider)) != "google" {
		return OAuthProfile{}, errors.New("unsupported oauth provider")
	}
	if len(v.googleAudiences) == 0 {
		return OAuthProfile{}, errors.New("google sign in is not configured")
	}
	claims, err := v.jwks.Verify(ctx, payload.IDToken, jwtVerifyOptions{
		Audiences: v.googleAudiences,
		Issuers:   []string{"accounts.google.com", "https://accounts.google.com"},
		JWKSURL:   v.googleJWKSURL,
	})
	if err != nil {
		return OAuthProfile{}, err
	}
	return profileFromClaims(claims, payload), nil
}

func profileFromClaims(claims map[string]any, payload OAuthPayload) OAuthProfile {
	return OAuthProfile{
		Email:          fallback(stringClaim(claims["email"]), payload.Email),
		FirstName:      fallback(stringClaim(claims["given_name"]), payload.FirstName),
		ImageURL:       fallback(stringClaim(claims["picture"]), payload.ImageURL),
		LastName:       fallback(stringClaim(claims["family_name"]), payload.LastName),
		ProviderUserID: fallback(stringClaim(claims["sub"]), payload.ProviderUserID),
	}
}

func stringClaim(value any) string {
	text, _ := value.(string)
	return strings.TrimSpace(text)
}

func fallback(values ...string) string {
	for _, value := range values {
		if strings.TrimSpace(value) != "" {
			return strings.TrimSpace(value)
		}
	}
	return ""
}
