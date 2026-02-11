#!/usr/bin/env bash
set -euo pipefail

if [ -z "${DATABASE_URL:-}" ]; then
  echo "DATABASE_URL is required"
  exit 1
fi

mkdir -p backups
stamp="$(date +%Y%m%d_%H%M%S)"
out="backups/dropy_${stamp}.sql.gz"

pg_dump "$DATABASE_URL" --no-owner --no-privileges | gzip > "$out"

echo "Backup created: $out"
