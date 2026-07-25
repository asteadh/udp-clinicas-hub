package httpserver

import (
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"

	"hubnegocios/backend/internal/admin"
	"hubnegocios/backend/internal/auth"
	"hubnegocios/backend/internal/config"
	"hubnegocios/backend/internal/contact"
	"hubnegocios/backend/internal/content"
	"hubnegocios/backend/internal/storage"
)

// App wires together the API's dependencies: config, database pool, and the
// per-domain services/handlers that Router assembles into the HTTP surface.
type App struct {
	cfg *config.Config
	db  *pgxpool.Pool

	authService  *auth.Service
	authHandlers *auth.Handlers

	passkeyHandlers *auth.PasskeyHandlers

	adminHandlers *admin.Handlers

	contentHandlers *content.Handlers
	contactHandlers *contact.Handlers
	storageHandlers *storage.Handlers
}

// NewApp constructs every service/handler the API needs. Google OAuth
// verification is only enabled when GoogleAllowedClientIDs is configured;
// otherwise oauth/link endpoints accept the client-submitted profile as-is
// (fine for local development, never for production).
func NewApp(cfg *config.Config, db *pgxpool.Pool) (*App, error) {
	authService := auth.NewService(db, cfg.JWTSecret)

	var verifier auth.OAuthVerifier
	if len(cfg.GoogleAllowedClientIDs) > 0 {
		verifier = auth.NewSocialVerifier(cfg)
	}
	authHandlers := auth.NewHandlers(authService, verifier)

	passkeyService, err := auth.NewPasskeyService(authService, db, cfg)
	if err != nil {
		return nil, fmt.Errorf("httpserver: passkey service: %w", err)
	}
	passkeyHandlers := auth.NewPasskeyHandlers(authService, passkeyService)

	adminRepo := admin.NewRepository(db)
	adminHandlers := admin.NewHandlers(authService, adminRepo, cfg.SuperadminEmails, cfg.AdminEmailDomains)

	contentRepo := content.NewRepository(db)
	contentHandlers := content.NewHandlers(contentRepo)

	contactRepo := contact.NewRepository(db)
	contactHandlers := contact.NewHandlers(contactRepo)

	storageService, err := storage.NewService(cfg)
	if err != nil {
		return nil, fmt.Errorf("httpserver: storage service: %w", err)
	}
	apiBaseURL := fmt.Sprintf("http://localhost:%s", cfg.Port)
	storageHandlers := storage.NewHandlers(storageService, cfg.StorageSigningSecret, apiBaseURL, authService)

	return &App{
		cfg:             cfg,
		db:              db,
		authService:     authService,
		authHandlers:    authHandlers,
		passkeyHandlers: passkeyHandlers,
		adminHandlers:   adminHandlers,
		contentHandlers: contentHandlers,
		contactHandlers: contactHandlers,
		storageHandlers: storageHandlers,
	}, nil
}
