#!/usr/bin/env bash
set -euo pipefail

if [ -z "${DATABASE_URL:-}" ]; then
  echo "DATABASE_URL is required"
  exit 1
fi

if [ $# -ne 1 ]; then
  echo "Usage: $0 <backup-file.sql.gz>"
  exit 1
fi

backup_file="$1"
if [ ! -f "$backup_file" ]; then
  echo "Backup file not found: $backup_file"
  exit 1
fi

read -r -p "This will overwrite data in target database. Continue? [y/N] " confirm
if [[ "$confirm" != "y" && "$confirm" != "Y" ]]; then
  echo "Restore canceled"
  exit 0
fi

gunzip -c "$backup_file" | psql "$DATABASE_URL"

echo "Restore completed from: $backup_file"
