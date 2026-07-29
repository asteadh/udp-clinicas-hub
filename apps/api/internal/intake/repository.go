package intake

import (
	"context"
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

// Insert stores an admission request submitted from a clinic's public intake
// form.
func (r *Repository) Insert(ctx context.Context, clinicSlug string, fullName string, rut string, email string, phone string, caseType string, caseDescription string, hasDocumentation string) (string, error) {
	if clinicSlug == "" || fullName == "" || rut == "" || email == "" || caseDescription == "" {
		return "", errors.New("clinicSlug, fullName, rut, email and caseDescription are required")
	}
	id, err := auth.NewID("ntk")
	if err != nil {
		return "", err
	}
	_, err = r.pool.Exec(ctx, `
INSERT INTO intake_requests (id, clinic_slug, full_name, rut, email, phone, case_type, case_description, has_documentation)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
		id, clinicSlug, fullName, rut, email, phone, caseType, caseDescription, hasDocumentation)
	if err != nil {
		return "", err
	}
	return id, nil
}
