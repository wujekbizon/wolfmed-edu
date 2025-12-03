#!/bin/bash

###############################################################################
# Database Backup Script for Neon PostgreSQL
#
# This script creates backups of your Neon database in multiple formats:
# 1. Full SQL dump
# 2. Compressed SQL dump (gzip)
# 3. Data-only dump
# 4. Schema-only dump
#
# Usage:
#   ./scripts/backup-database.sh [environment]
#
# Arguments:
#   environment - Optional. Either 'production' or 'development'
#                 If not specified, uses NEON_DATABASE_URL from .env
#
# Examples:
#   ./scripts/backup-database.sh                # Uses default .env
#   ./scripts/backup-database.sh production     # Uses .env.production
#   ./scripts/backup-database.sh development    # Uses .env.development
#
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
ENV_FILE=".env"

# Parse environment argument
if [ ! -z "$1" ]; then
  ENV_FILE=".env.$1"
  echo -e "${BLUE}Using environment file: $ENV_FILE${NC}"
fi

# Check if environment file exists
if [ ! -f "$ENV_FILE" ]; then
  echo -e "${RED}Error: Environment file $ENV_FILE not found${NC}"
  echo "Please create $ENV_FILE with NEON_DATABASE_URL"
  exit 1
fi

# Load environment variables
export $(cat "$ENV_FILE" | grep -v '^#' | xargs)

# Check if DATABASE_URL is set
if [ -z "$NEON_DATABASE_URL" ]; then
  echo -e "${RED}Error: NEON_DATABASE_URL not found in $ENV_FILE${NC}"
  exit 1
fi

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}  Database Backup Utility${NC}"
echo -e "${BLUE}================================${NC}"
echo -e "Timestamp: $(date)"
echo -e "Backup Directory: $BACKUP_DIR"
echo -e "${BLUE}================================${NC}\n"

# Function to run backup with error handling
run_backup() {
  local backup_type=$1
  local output_file=$2
  local pg_dump_args=$3

  echo -e "${YELLOW}📦 Creating $backup_type backup...${NC}"

  if eval "pg_dump \"$NEON_DATABASE_URL\" $pg_dump_args > \"$output_file\" 2>&1"; then
    local file_size=$(du -h "$output_file" | cut -f1)
    echo -e "${GREEN}✅ $backup_type backup complete: $output_file ($file_size)${NC}\n"
    return 0
  else
    echo -e "${RED}❌ $backup_type backup failed${NC}\n"
    return 1
  fi
}

# Track success/failure
BACKUP_RESULTS=()

# 1. Full database backup (plain SQL)
FULL_BACKUP="$BACKUP_DIR/full-backup-$TIMESTAMP.sql"
if run_backup "Full database" "$FULL_BACKUP" "--clean --if-exists --verbose"; then
  BACKUP_RESULTS+=("✅ Full backup")
else
  BACKUP_RESULTS+=("❌ Full backup")
fi

# 2. Compressed full backup (saves disk space)
COMPRESSED_BACKUP="$BACKUP_DIR/full-backup-$TIMESTAMP.sql.gz"
echo -e "${YELLOW}📦 Creating compressed backup...${NC}"
if pg_dump "$NEON_DATABASE_URL" --clean --if-exists | gzip > "$COMPRESSED_BACKUP" 2>&1; then
  COMPRESSED_SIZE=$(du -h "$COMPRESSED_BACKUP" | cut -f1)
  echo -e "${GREEN}✅ Compressed backup complete: $COMPRESSED_BACKUP ($COMPRESSED_SIZE)${NC}\n"
  BACKUP_RESULTS+=("✅ Compressed backup")
else
  echo -e "${RED}❌ Compressed backup failed${NC}\n"
  BACKUP_RESULTS+=("❌ Compressed backup")
fi

# 3. Data-only backup (no schema)
DATA_BACKUP="$BACKUP_DIR/data-only-$TIMESTAMP.sql"
if run_backup "Data-only" "$DATA_BACKUP" "--data-only --column-inserts"; then
  BACKUP_RESULTS+=("✅ Data-only backup")
else
  BACKUP_RESULTS+=("❌ Data-only backup")
fi

# 4. Schema-only backup (no data)
SCHEMA_BACKUP="$BACKUP_DIR/schema-only-$TIMESTAMP.sql"
if run_backup "Schema-only" "$SCHEMA_BACKUP" "--schema-only"; then
  BACKUP_RESULTS+=("✅ Schema-only backup")
else
  BACKUP_RESULTS+=("❌ Schema-only backup")
fi

# 5. Wolfmed tables only (filtered)
WOLFMED_BACKUP="$BACKUP_DIR/wolfmed-tables-$TIMESTAMP.sql"
echo -e "${YELLOW}📦 Creating wolfmed tables backup...${NC}"
if pg_dump "$NEON_DATABASE_URL" --table='wolfmed_*' --clean --if-exists > "$WOLFMED_BACKUP" 2>&1; then
  WOLFMED_SIZE=$(du -h "$WOLFMED_BACKUP" | cut -f1)
  echo -e "${GREEN}✅ Wolfmed tables backup complete: $WOLFMED_BACKUP ($WOLFMED_SIZE)${NC}\n"
  BACKUP_RESULTS+=("✅ Wolfmed tables backup")
else
  echo -e "${RED}❌ Wolfmed tables backup failed${NC}\n"
  BACKUP_RESULTS+=("❌ Wolfmed tables backup")
fi

# Summary
echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}  Backup Summary${NC}"
echo -e "${BLUE}================================${NC}"

for result in "${BACKUP_RESULTS[@]}"; do
  echo -e "$result"
done

echo -e "\n${BLUE}📁 All backups saved to: $BACKUP_DIR${NC}"
echo -e "${BLUE}================================${NC}\n"

# List all backups
echo -e "${YELLOW}Recent backups in $BACKUP_DIR:${NC}"
ls -lht "$BACKUP_DIR" | head -10

# Cleanup old backups (keep last 10)
echo -e "\n${YELLOW}🧹 Cleaning up old backups (keeping last 10)...${NC}"
BACKUP_COUNT=$(ls -1 "$BACKUP_DIR" | wc -l)

if [ $BACKUP_COUNT -gt 10 ]; then
  echo "Found $BACKUP_COUNT backups, removing oldest..."
  ls -t "$BACKUP_DIR" | tail -n +11 | xargs -I {} rm "$BACKUP_DIR/{}"
  echo -e "${GREEN}✅ Cleanup complete${NC}"
else
  echo "Only $BACKUP_COUNT backups found, no cleanup needed"
fi

echo -e "\n${GREEN}🎉 Backup process complete!${NC}"

# Exit with success if at least the full backup succeeded
if [[ "${BACKUP_RESULTS[0]}" == *"✅"* ]]; then
  exit 0
else
  echo -e "${RED}❌ Critical: Full backup failed. Please investigate.${NC}"
  exit 1
fi
