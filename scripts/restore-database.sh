#!/bin/bash

###############################################################################
# Database Restore Script for Neon PostgreSQL
#
# This script restores your Neon database from a backup file.
# ⚠️  WARNING: This will DROP and RECREATE your database schema!
#
# Usage:
#   ./scripts/restore-database.sh <backup-file> [environment]
#
# Arguments:
#   backup-file - Required. Path to the backup SQL file
#   environment - Optional. Either 'production' or 'development'
#                 If not specified, uses NEON_DATABASE_URL from .env
#
# Examples:
#   ./scripts/restore-database.sh ./backups/full-backup-20240115-020000.sql
#   ./scripts/restore-database.sh ./backups/full-backup-20240115-020000.sql.gz
#   ./scripts/restore-database.sh ./backups/data-only-20240115-020000.sql development
#
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if backup file argument is provided
if [ -z "$1" ]; then
  echo -e "${RED}Error: Backup file not specified${NC}"
  echo "Usage: $0 <backup-file> [environment]"
  echo ""
  echo "Examples:"
  echo "  $0 ./backups/full-backup-20240115-020000.sql"
  echo "  $0 ./backups/full-backup-20240115-020000.sql.gz"
  echo "  $0 ./backups/data-only-20240115-020000.sql development"
  exit 1
fi

BACKUP_FILE="$1"
ENV_FILE=".env"

# Parse environment argument
if [ ! -z "$2" ]; then
  ENV_FILE=".env.$2"
  echo -e "${BLUE}Using environment file: $ENV_FILE${NC}"
fi

# Check if backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
  echo -e "${RED}Error: Backup file not found: $BACKUP_FILE${NC}"
  exit 1
fi

# Check if environment file exists
if [ ! -f "$ENV_FILE" ]; then
  echo -e "${RED}Error: Environment file $ENV_FILE not found${NC}"
  exit 1
fi

# Load environment variables
export $(cat "$ENV_FILE" | grep -v '^#' | xargs)

# Check if DATABASE_URL is set
if [ -z "$NEON_DATABASE_URL" ]; then
  echo -e "${RED}Error: NEON_DATABASE_URL not found in $ENV_FILE${NC}"
  exit 1
fi

# Get file info
FILE_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
IS_COMPRESSED=false

if [[ "$BACKUP_FILE" == *.gz ]]; then
  IS_COMPRESSED=true
fi

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}  Database Restore Utility${NC}"
echo -e "${BLUE}================================${NC}"
echo -e "Timestamp: $(date)"
echo -e "Backup File: $BACKUP_FILE"
echo -e "File Size: $FILE_SIZE"
echo -e "Compressed: $IS_COMPRESSED"
echo -e "Target Database: ${NEON_DATABASE_URL:0:30}..."
echo -e "${BLUE}================================${NC}\n"

# Safety confirmation
echo -e "${RED}⚠️  WARNING: This will DESTROY all existing data in the target database!${NC}"
echo -e "${YELLOW}Are you sure you want to restore from this backup?${NC}"
echo -e "Type 'yes' to continue or anything else to cancel:"
read -r confirmation

if [ "$confirmation" != "yes" ]; then
  echo -e "${YELLOW}Restore cancelled by user${NC}"
  exit 0
fi

echo -e "\n${YELLOW}Double confirmation: Type the database name to confirm:${NC}"
echo -e "Extract from your DATABASE_URL (e.g., 'myproject-db'):"
read -r db_confirmation

# Extract database name from URL for verification
DB_NAME=$(echo "$NEON_DATABASE_URL" | sed -n 's/.*\/\([^?]*\).*/\1/p')

if [ "$db_confirmation" != "$DB_NAME" ]; then
  echo -e "${RED}Database name doesn't match. Restore cancelled for safety.${NC}"
  exit 1
fi

echo -e "\n${GREEN}✓ Confirmation received. Starting restore...${NC}\n"

# Create a pre-restore backup
echo -e "${YELLOW}📦 Creating pre-restore backup for safety...${NC}"
PRE_RESTORE_BACKUP="./backups/pre-restore-backup-$(date +%Y%m%d-%H%M%S).sql.gz"
mkdir -p ./backups

if pg_dump "$NEON_DATABASE_URL" | gzip > "$PRE_RESTORE_BACKUP" 2>&1; then
  PRE_RESTORE_SIZE=$(du -h "$PRE_RESTORE_BACKUP" | cut -f1)
  echo -e "${GREEN}✅ Pre-restore backup saved: $PRE_RESTORE_BACKUP ($PRE_RESTORE_SIZE)${NC}\n"
else
  echo -e "${RED}❌ Pre-restore backup failed. Aborting restore.${NC}"
  exit 1
fi

# Drop and recreate schema (optional - depends on backup type)
echo -e "${YELLOW}🗑️  Preparing database for restore...${NC}"

# Only drop schema if it's a full backup (not data-only)
if [[ "$BACKUP_FILE" != *"data-only"* ]]; then
  echo -e "${YELLOW}Dropping existing schema...${NC}"
  psql "$NEON_DATABASE_URL" << 'SQL' 2>&1 | grep -v "NOTICE" || true
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
SQL
  echo -e "${GREEN}✅ Schema reset complete${NC}\n"
fi

# Restore from backup
echo -e "${YELLOW}📥 Restoring database from backup...${NC}"
echo -e "${BLUE}This may take a while depending on database size...${NC}\n"

if [ "$IS_COMPRESSED" = true ]; then
  # Restore from compressed backup
  echo -e "${YELLOW}Decompressing and restoring...${NC}"
  if gunzip -c "$BACKUP_FILE" | psql "$NEON_DATABASE_URL" 2>&1 | tee /tmp/restore-log.txt; then
    echo -e "${GREEN}✅ Restore from compressed backup complete${NC}"
  else
    echo -e "${RED}❌ Restore failed. Check /tmp/restore-log.txt for details${NC}"
    echo -e "${YELLOW}You can restore the pre-restore backup: $PRE_RESTORE_BACKUP${NC}"
    exit 1
  fi
else
  # Restore from uncompressed backup
  if psql "$NEON_DATABASE_URL" < "$BACKUP_FILE" 2>&1 | tee /tmp/restore-log.txt; then
    echo -e "${GREEN}✅ Restore complete${NC}"
  else
    echo -e "${RED}❌ Restore failed. Check /tmp/restore-log.txt for details${NC}"
    echo -e "${YELLOW}You can restore the pre-restore backup: $PRE_RESTORE_BACKUP${NC}"
    exit 1
  fi
fi

# Post-restore verification
echo -e "\n${YELLOW}🔍 Running post-restore verification...${NC}\n"

# Count tables
TABLE_COUNT=$(psql "$NEON_DATABASE_URL" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_name LIKE 'wolfmed_%';" 2>/dev/null | tr -d ' ')

echo -e "${BLUE}Post-Restore Stats:${NC}"
echo -e "  Tables restored: $TABLE_COUNT"

# Get row counts for key tables
echo -e "\n${BLUE}Key Table Row Counts:${NC}"
for table in wolfmed_users wolfmed_tests wolfmed_procedures wolfmed_forum_posts wolfmed_completed_tests; do
  if psql "$NEON_DATABASE_URL" -c "\d $table" &>/dev/null; then
    COUNT=$(psql "$NEON_DATABASE_URL" -t -c "SELECT COUNT(*) FROM $table;" 2>/dev/null | tr -d ' ')
    echo -e "  $table: $COUNT rows"
  fi
done

echo -e "\n${BLUE}================================${NC}"
echo -e "${GREEN}🎉 Database Restore Complete!${NC}"
echo -e "${BLUE}================================${NC}\n"

echo -e "${YELLOW}Next Steps:${NC}"
echo -e "1. Test your application to verify everything works"
echo -e "2. Run verification script: npx tsx scripts/verify-migration.ts"
echo -e "3. Check application logs for any database errors"
echo -e "4. If issues occur, you can restore from: $PRE_RESTORE_BACKUP"

echo -e "\n${BLUE}Pre-restore backup location: $PRE_RESTORE_BACKUP${NC}"
echo -e "${BLUE}Restore log: /tmp/restore-log.txt${NC}\n"

exit 0
