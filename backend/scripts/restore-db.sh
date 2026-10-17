#!/usr/bin/env bash
# ==============================================================================
# PostgreSQL Database Restoration Script — Intern Infotech Portal
# ==============================================================================
set -e

if [ -z "$1" ]; then
    echo "Usage: ./restore-db.sh <path-to-backup-file.sql.gz>"
    echo "Example: ./restore-db.sh /var/backups/postgres/infotech_backup_20260401_020000.sql.gz"
    exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "${BACKUP_FILE}" ]; then
    echo "Error: Backup file not found at ${BACKUP_FILE}"
    exit 1
fi

echo "WARNING: Restoring will overwrite existing data in 'intern_infotech_db'!"
read -p "Are you sure you want to proceed? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Restoration aborted."
    exit 0
fi

echo "Restoring database from ${BACKUP_FILE}..."

if command -v docker-compose &> /dev/null; then
    gunzip -c "${BACKUP_FILE}" | docker-compose exec -T postgres psql -U postgres -d intern_infotech_db
else
    gunzip -c "${BACKUP_FILE}" | PGPASSWORD="${PGPASSWORD:-postgres}" psql -h localhost -U postgres -d intern_infotech_db
fi

echo "Database restoration completed successfully!"
