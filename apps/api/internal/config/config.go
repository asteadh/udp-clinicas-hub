package config

import (
	"fmt"
	"os"
	"strings"
)

// Config holds all runtime configuration for the API, loaded from environment
// variables. It is populated once at process startup via Load().
type Config struct {
	Port        string
	DatabaseURL string

	JWTSecret string

	GoogleClientID         string
	GoogleClientSecret     string
	GoogleAllowedClientIDs []string
	AdminEmailDomains      []string

	WebAuthnRPID      string
	WebAuthnRPName    string
	WebAuthnRPOrigins []string

	S3Endpoint           string
	S3AccessKeyID        string
	S3SecretAccessKey    string
	S3BucketName         string
	S3Region             string
	S3ForcePathStyle     bool
	StorageSigningSecret string

	RedisURL string

	AllowedOrigins []string

	SuperadminEmails []string
}

func Load() (*Config, error) {
	cfg := &Config{
		Port:        getEnv("API_PORT", "4000"),
		DatabaseURL: os.Getenv("DATABASE_URL"),

		JWTSecret: os.Getenv("JWT_SECRET"),

		GoogleClientID:         os.Getenv("GOOGLE_CLIENT_ID"),
		GoogleClientSecret:     os.Getenv("GOOGLE_CLIENT_SECRET"),
		GoogleAllowedClientIDs: splitCSV(os.Getenv("GOOGLE_ALLOWED_CLIENT_IDS")),
		AdminEmailDomains:      splitCSV(getEnv("ADMIN_EMAIL_DOMAINS", "udp.cl,mail.udp.cl")),

		WebAuthnRPID:      getEnv("WEBAUTHN_RP_ID", "localhost"),
		WebAuthnRPName:    getEnv("WEBAUTHN_RP_NAME", "Hub Negocios UDP"),
		WebAuthnRPOrigins: splitCSV(os.Getenv("WEBAUTHN_RP_ORIGINS")),

		S3Endpoint:           os.Getenv("S3_ENDPOINT"),
		S3AccessKeyID:        os.Getenv("S3_ACCESS_KEY_ID"),
		S3SecretAccessKey:    os.Getenv("S3_SECRET_ACCESS_KEY"),
		S3BucketName:         os.Getenv("S3_BUCKET_NAME"),
		S3Region:             getEnv("S3_REGION", "us-east-1"),
		S3ForcePathStyle:     getEnv("S3_FORCE_PATH_STYLE", "true") == "true",
		StorageSigningSecret: os.Getenv("STORAGE_SIGNING_SECRET"),

		RedisURL: os.Getenv("REDIS_URL"),

		AllowedOrigins: splitCSV(os.Getenv("ALLOWED_ORIGINS")),

		SuperadminEmails: splitCSV(os.Getenv("HUBNEGOCIOS_SUPERADMIN_EMAILS")),
	}

	if cfg.DatabaseURL == "" {
		return nil, fmt.Errorf("DATABASE_URL is required")
	}
	if cfg.JWTSecret == "" {
		return nil, fmt.Errorf("JWT_SECRET is required")
	}

	return cfg, nil
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func splitCSV(v string) []string {
	if v == "" {
		return nil
	}
	parts := strings.Split(v, ",")
	out := make([]string, 0, len(parts))
	for _, p := range parts {
		p = strings.TrimSpace(p)
		if p != "" {
			out = append(out, p)
		}
	}
	return out
}
