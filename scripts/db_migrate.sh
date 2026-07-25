#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

if [ -f .env ]; then
  set -a
  source .env
  set +a
fi

export DATABASE_URL="${DATABASE_URL:-postgres://hubnegocios:change-me@localhost:15432/hubnegocios?sslmode=disable}"

docker compose exec -T db psql -U "${POSTGRES_USER:-hubnegocios}" -d "${POSTGRES_DB:-hubnegocios}" \
  -c "CREATE EXTENSION IF NOT EXISTS pgcrypto;"

go run ./cmd/seed -migrate-only

pnpm --filter @hubnegocios/db exec prisma migrate dev --schema prisma/schema.prisma
