package main

import (
	"context"
	"log"
	"net/http"

	"hubnegocios/backend/internal/config"
	"hubnegocios/backend/internal/database"
	"hubnegocios/backend/internal/httpserver"
)

func main() {
	ctx := context.Background()

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

	app, err := httpserver.NewApp(cfg, pool)
	if err != nil {
		log.Fatalf("httpserver: %v", err)
	}

	addr := ":" + cfg.Port
	log.Printf("hubnegocios api listening on %s", addr)
	if err := http.ListenAndServe(addr, app.Router()); err != nil {
		log.Fatalf("server: %v", err)
	}
}
