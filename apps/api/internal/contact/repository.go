package contact

import (
	"context"
	"encoding/json"
	"errors"

	"github.com/jackc/pgx/v5/pgxpool"

	"hubnegocios/backend/internal/auth"
)

type Repository struct {
	pool *pgxpool.Pool
}

func NewRepository(pool *pgxpool.Pool) *Repository {
	return &Repository{pool: pool}
}

// Insert stores an inquiry submitted from a clinic's public contact form.
// metadata (e.g. source page, UTM params) is stored as jsonb but the table
// itself has no metadata column, so it is folded into internal_notes as a
// JSON note the admin inbox can display.
func (r *Repository) Insert(ctx context.Context, clinicSlug string, fullName string, email string, phone string, message string, source string, metadata map[string]any) (string, error) {
	if clinicSlug == "" || fullName == "" || email == "" || message == "" {
		return "", errors.New("clinicSlug, fullName, email and message are required")
	}
	id, err := auth.NewID("inq")
	if err != nil {
		return "", err
	}
	note := ""
	if len(metadata) > 0 || source != "" {
		payload := map[string]any{"source": source, "metadata": metadata}
		raw, err := json.Marshal(payload)
		if err != nil {
			return "", err
		}
		note = string(raw)
	}
	_, err = r.pool.Exec(ctx, `
INSERT INTO contact_inquiries (id, clinic_slug, full_name, email, phone, message, internal_notes)
VALUES ($1, $2, $3, $4, $5, $6, $7)`,
		id, clinicSlug, fullName, email, phone, message, note)
	if err != nil {
		return "", err
	}
	return id, nil
}
