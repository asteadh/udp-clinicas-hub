package main

import (
	"context"
	"fmt"
	"log"
	"os"

	"github.com/jackc/pgx/v5/pgxpool"

	"hubnegocios/backend/internal/auth"
	"hubnegocios/backend/internal/config"
	"hubnegocios/backend/internal/database"
)

func main() {
	ctx := context.Background()

	demo := false
	migrateOnly := false
	for _, arg := range os.Args[1:] {
		switch arg {
		case "--demo":
			demo = true
		case "-migrate-only", "--migrate-only":
			migrateOnly = true
		}
	}

	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("config: %v", err)
	}

	pool, err := database.Open(ctx, cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("database: %v", err)
	}
	defer pool.Close()

	if err := database.Migrate(ctx, pool, "migrations"); err != nil {
		log.Fatalf("migrate: %v", err)
	}
	fmt.Println("migrated: schema up to date")

	if migrateOnly {
		return
	}

	if err := database.RunSQLFile(ctx, pool, "seeds/clinics_seed.sql"); err != nil {
		log.Fatalf("seed clinics: %v", err)
	}
	fmt.Println("seeded: clinics")

	if demo {
		if err := database.RunSQLFile(ctx, pool, "seeds/demo_seed.sql"); err != nil {
			log.Fatalf("seed demo content: %v", err)
		}
		fmt.Println("seeded: demo content (laboral clinic)")
	}

	password := os.Getenv("HUBNEGOCIOS_ADMIN_SEED_PASSWORD")
	if len(cfg.SuperadminEmails) > 0 && password != "" {
		hash, err := auth.HashPassword(password)
		if err != nil {
			log.Fatalf("hash superadmin password: %v", err)
		}
		for _, email := range cfg.SuperadminEmails {
			userID, err := seedSuperadmin(ctx, pool, email, hash)
			if err != nil {
				log.Fatalf("seed superadmin %s: %v", email, err)
			}
			fmt.Printf("seeded: superadmin %s (%s)\n", email, userID)
		}
	} else {
		fmt.Println("skipped: superadmin seed (set HUBNEGOCIOS_SUPERADMIN_EMAILS and HUBNEGOCIOS_ADMIN_SEED_PASSWORD to enable)")
	}
}

// seedSuperadmin creates or updates an active app_users row with a break-glass
// password for email, and grants it full superadmin admin_roles access.
func seedSuperadmin(ctx context.Context, pool *pgxpool.Pool, email string, passwordHash string) (string, error) {
	userID, err := auth.NewID("usr")
	if err != nil {
		return "", err
	}

	err = pool.QueryRow(ctx, `
INSERT INTO app_users (id, uid, email, email_verified, password_hash, status, suspended, inactive)
VALUES ($1, $1, $2, true, $3, 'active', false, false)
ON CONFLICT (email) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  status = 'active',
  suspended = false,
  inactive = false,
  deleted_at = NULL,
  updated_at = now()
RETURNING id`, userID, email, passwordHash).Scan(&userID)
	if err != nil {
		return "", err
	}

	_, err = pool.Exec(ctx, `
INSERT INTO admin_roles (user_id, role, clinic_slug, permissions)
VALUES ($1, 'superadmin', NULL, ARRAY['*'])
ON CONFLICT (user_id) DO UPDATE SET role = 'superadmin', clinic_slug = NULL, permissions = ARRAY['*'], updated_at = now()`,
		userID)
	if err != nil {
		return "", err
	}
	return userID, nil
}
