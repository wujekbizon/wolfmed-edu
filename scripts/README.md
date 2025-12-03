# Database Migration Scripts

This directory contains scripts to help you safely migrate your Neon PostgreSQL database.

## 📋 Available Scripts

### 1. `backup-database.sh` - Create Database Backups

Creates multiple backup formats of your database.

**Usage:**
```bash
# Backup using default .env
./scripts/backup-database.sh

# Backup production database
./scripts/backup-database.sh production

# Backup development database
./scripts/backup-database.sh development
```

**What it creates:**
- `full-backup-TIMESTAMP.sql` - Complete database dump
- `full-backup-TIMESTAMP.sql.gz` - Compressed backup (recommended for storage)
- `data-only-TIMESTAMP.sql` - Just the data, no schema
- `schema-only-TIMESTAMP.sql` - Just the schema, no data
- `wolfmed-tables-TIMESTAMP.sql` - Only wolfmed_* tables

**Automatic cleanup:** Keeps the 10 most recent backups, removes older ones.

---

### 2. `restore-database.sh` - Restore from Backup

Restores your database from a backup file.

⚠️ **WARNING:** This will destroy existing data!

**Usage:**
```bash
# Restore to default database
./scripts/restore-database.sh ./backups/full-backup-20240115-020000.sql

# Restore compressed backup
./scripts/restore-database.sh ./backups/full-backup-20240115-020000.sql.gz

# Restore to development database
./scripts/restore-database.sh ./backups/full-backup-20240115-020000.sql development
```

**Safety features:**
- Requires double confirmation (yes + database name)
- Creates pre-restore backup automatically
- Detailed logging to `/tmp/restore-log.txt`

---

### 3. `verify-migration.ts` - Verify Database Health

Checks that your database is in good shape after migration.

**Usage:**
```bash
# Run verification
npx tsx scripts/verify-migration.ts

# Or add to package.json
npm run verify-db
```

**What it checks:**
- ✅ All expected tables exist
- ✅ Row counts for each table
- ✅ Foreign key constraints are correct
- ✅ Basic queries work
- ✅ Table indexes are in place
- ✅ Critical tables have data

**Exit codes:**
- `0` - All checks passed
- `1` - Some checks failed (safe to use in CI/CD)

---

## 🚀 Quick Start: Migration Workflow

Here's the recommended workflow for migrating to production:

### **Step 1: Backup Production Database**

```bash
# Create backup of production
./scripts/backup-database.sh production
```

✅ Backup saved to `./backups/full-backup-YYYYMMDD-HHMMSS.sql.gz`

---

### **Step 2: Test Migration on Staging (Neon Branch)**

1. In Neon Console, create a branch from production:
   - Branch name: `staging-migration-test`
   - From: `main` (production)

2. Get the staging connection string and test:

```bash
# Set staging URL in your environment
export NEON_DATABASE_URL="your-staging-branch-url"

# Checkout your feature branch
git checkout add-new-eductional-path

# Push schema changes to staging
npm run db:push

# Verify staging migration
npx tsx scripts/verify-migration.ts
```

---

### **Step 3: Migrate Production**

Schedule during low-traffic hours (e.g., 2 AM):

```bash
# Set production URL
export NEON_DATABASE_URL="your-production-url"

# Checkout feature branch
git checkout add-new-eductional-path

# Push schema to production
npm run db:push

# Verify production migration
npx tsx scripts/verify-migration.ts
```

If verification passes ✅:
- Deploy your application
- Monitor for errors

If verification fails ❌:
- Restore from backup (see Step 4)

---

### **Step 4: Rollback (if needed)**

If something goes wrong:

```bash
# Option A: Restore from backup
./scripts/restore-database.sh ./backups/full-backup-YYYYMMDD-HHMMSS.sql.gz production

# Option B: Use Neon backup branch
# In Neon Console, reset main branch to backup branch
```

---

## 📦 Add to package.json

Add these convenient scripts:

```json
{
  "scripts": {
    "db:push": "drizzle-kit push",
    "db:studio": "drizzle-kit studio",
    "db:backup": "./scripts/backup-database.sh",
    "db:verify": "tsx scripts/verify-migration.ts"
  }
}
```

Then use:
```bash
npm run db:backup
npm run db:verify
```

---

## 🔧 Environment Setup

### Required Environment Variables

Create `.env` files with:

```bash
# .env (default)
NEON_DATABASE_URL="postgresql://user:pass@host/database"

# .env.production
NEON_DATABASE_URL="postgresql://user:pass@production-host/database"

# .env.development
NEON_DATABASE_URL="postgresql://user:pass@dev-host/database"
```

### Required Tools

Make sure these are installed:

```bash
# Check if installed
which psql        # PostgreSQL client
which pg_dump     # Backup tool
which tsx         # TypeScript executor

# Install if missing
# PostgreSQL tools
brew install postgresql  # macOS
apt install postgresql-client  # Ubuntu/Debian

# TSX for TypeScript
npm install -g tsx
```

---

## 📊 Understanding Backup Sizes

Example from a typical application:

```
full-backup-20240115-020000.sql      →  45 MB  (readable SQL)
full-backup-20240115-020000.sql.gz   →  8 MB   (compressed - best for storage)
data-only-20240115-020000.sql        →  38 MB  (data only, reusable)
schema-only-20240115-020000.sql      →  15 KB  (schema only, fast)
wolfmed-tables-20240115-020000.sql   →  42 MB  (filtered tables)
```

**💡 Tip:** Use compressed backups (`.sql.gz`) for long-term storage - they're 5-10x smaller!

---

## 🆘 Troubleshooting

### "pg_dump: command not found"

Install PostgreSQL client tools:
```bash
# macOS
brew install postgresql

# Ubuntu/Debian
sudo apt install postgresql-client

# Windows
# Install from: https://www.postgresql.org/download/windows/
```

### "NEON_DATABASE_URL not found"

Make sure your `.env` file exists and has the variable:
```bash
cat .env | grep NEON_DATABASE_URL
```

### "Permission denied" on scripts

Make scripts executable:
```bash
chmod +x scripts/*.sh
```

### Restore fails with "relation already exists"

Use the correct backup type:
- For full restore: Use `full-backup-*.sql`
- For data-only restore: Use `data-only-*.sql` (don't drop schema first)

### Verification script fails

Check your database connection:
```bash
# Test connection
psql "$NEON_DATABASE_URL" -c "SELECT version();"
```

---

## 📚 Additional Resources

- **Full Migration Guide:** See [NEON_MIGRATION_GUIDE.md](../NEON_MIGRATION_GUIDE.md)
- **Neon Documentation:** https://neon.tech/docs
- **Drizzle ORM Docs:** https://orm.drizzle.team/docs
- **PostgreSQL Backup Guide:** https://www.postgresql.org/docs/current/backup.html

---

## ⚡ Pro Tips

1. **Always test on staging first** - Never run migrations directly on production without testing
2. **Schedule migrations during low-traffic hours** - Minimize impact on users
3. **Keep backups for at least 30 days** - You never know when you'll need them
4. **Use Neon branching** - It's instant and free, perfect for testing
5. **Monitor after migration** - Watch error logs for 24-48 hours post-migration
6. **Document everything** - Add notes about what changed and why

---

## 🎯 Your First Migration

New to database migrations? Follow this safe workflow:

```bash
# 1. Create a backup
npm run db:backup

# 2. Test on a Neon staging branch first
# (Create in Neon Console, get URL)
export NEON_DATABASE_URL="staging-url"
npm run db:push
npm run db:verify

# 3. If staging looks good, do production
export NEON_DATABASE_URL="production-url"
npm run db:push
npm run db:verify

# 4. If something breaks
./scripts/restore-database.sh ./backups/latest-backup.sql.gz
```

**Good luck! 🚀**
