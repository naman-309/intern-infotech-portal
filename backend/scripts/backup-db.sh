#!/usr/bin/env bash
# ==============================================================================
# Automated PostgreSQL Backup Script — Intern Infotech Portal
# ==============================================================================
set -e

BACKUP_DIR="/var/backups/postgres"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/infotech_backup_${TIMESTAMP}.sql.gz"
RETENTION_DAYS=14

mkdir -p "${BACKUP_DIR}"

echo "[$(date)] Starting PostgreSQL automated backup..."

# If running inside Docker Compose setup
if command -v docker-compose &> /dev/null; then
    docker-compose exec -T postgres pg_dump -U postgres intern_infotech_db | gzip > "${BACKUP_FILE}"
else
    # Direct local/EC2 psql backup
    PGPASSWORD="${PGPASSWORD:-postgres}" pg_dump -h localhost -U postgres -d intern_infotech_db | gzip > "${BACKUP_FILE}"
fi

echo "[$(date)] Backup completed successfully: ${BACKUP_FILE} ($(du -h "${BACKUP_FILE}" | cut -f1))"

# Prune old backups older than RETENTION_DAYS
find "${BACKUP_DIR}" -type f -name "infotech_backup_*.sql.gz" -mtime +${RETENTION_DAYS} -delete
echo "[$(date)] Pruned backup archives older than ${RETENTION_DAYS} days."
