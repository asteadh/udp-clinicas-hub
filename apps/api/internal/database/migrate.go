package database

import (
	"context"
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strings"

	"github.com/jackc/pgx/v5/pgxpool"
)

// Migrate applies every .sql file in migrationsDir that has not yet been
// recorded in the schema_migrations table, in filename order.
func Migrate(ctx context.Context, pool *pgxpool.Pool, migrationsDir string) error {
	if err := ensureMigrationTable(ctx, pool); err != nil {
		return err
	}

	files, err := sqlFiles(migrationsDir)
	if err != nil {
		return err
	}

	for _, file := range files {
		version := filepath.Base(file)

		applied, err := migrationApplied(ctx, pool, version)
		if err != nil {
			return err
		}
		if applied {
			continue
		}

		if err := RunSQLFile(ctx, pool, file); err != nil {
			return fmt.Errorf("migrate: %s: %w", version, err)
		}

		if _, err := pool.Exec(ctx, `INSERT INTO schema_migrations(version) VALUES($1)`, version); err != nil {
			return fmt.Errorf("migrate: record %s: %w", version, err)
		}
	}

	return nil
}

// RunSQLFile executes the full contents of a single SQL file against the pool.
func RunSQLFile(ctx context.Context, pool *pgxpool.Pool, path string) error {
	sqlBytes, err := os.ReadFile(path)
	if err != nil {
		return fmt.Errorf("read %s: %w", path, err)
	}

	if _, err := pool.Exec(ctx, string(sqlBytes)); err != nil {
		return fmt.Errorf("exec %s: %w", path, err)
	}

	return nil
}

func ensureMigrationTable(ctx context.Context, pool *pgxpool.Pool) error {
	_, err := pool.Exec(ctx, `
		CREATE TABLE IF NOT EXISTS schema_migrations (
			version text PRIMARY KEY,
			applied_at timestamptz NOT NULL DEFAULT now()
		)
	`)
	if err != nil {
		return fmt.Errorf("migrate: ensure schema_migrations: %w", err)
	}
	return nil
}

func migrationApplied(ctx context.Context, pool *pgxpool.Pool, version string) (bool, error) {
	var exists bool
	err := pool.QueryRow(ctx, `SELECT EXISTS(SELECT 1 FROM schema_migrations WHERE version = $1)`, version).Scan(&exists)
	if err != nil {
		return false, fmt.Errorf("migrate: check %s: %w", version, err)
	}
	return exists, nil
}

func sqlFiles(dir string) ([]string, error) {
	entries, err := os.ReadDir(dir)
	if err != nil {
		return nil, fmt.Errorf("migrate: read dir %s: %w", dir, err)
	}

	var files []string
	for _, entry := range entries {
		if entry.IsDir() || !strings.HasSuffix(entry.Name(), ".sql") {
			continue
		}
		files = append(files, filepath.Join(dir, entry.Name()))
	}

	sort.Strings(files)
	return files, nil
}
