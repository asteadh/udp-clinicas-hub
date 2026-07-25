package auth

import "context"

type OAuthPayload struct {
	AccessToken       string `json:"accessToken"`
	AuthorizationCode string `json:"authorizationCode"`
	Email             string `json:"email"`
	FirstName         string `json:"firstName"`
	IDToken           string `json:"idToken"`
	ImageURL          string `json:"imageUrl"`
	LastName          string `json:"lastName"`
	ProviderUserID    string `json:"providerUserId"`
}

type OAuthProfile struct {
	Email          string
	FirstName      string
	ImageURL       string
	LastName       string
	ProviderUserID string
}

type OAuthVerifier interface {
	VerifyOAuth(ctx context.Context, provider string, payload OAuthPayload) (OAuthProfile, error)
}
