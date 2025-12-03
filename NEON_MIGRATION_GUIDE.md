# Neon Database Migration Guide

## Overview
This guide walks you through safely migrating schema changes from your development branch to production on Neon PostgreSQL database.

## Table of Contents
1. [Pre-Migration Checklist](#pre-migration-checklist)
2. [Step 1: Backup Production Database](#step-1-backup-production-database)
3. [Step 2: Compare Schemas](#step-2-compare-schemas)
4. [Step 3: Generate and Review Migrations](#step-3-generate-and-review-migrations)
5. [Step 4: Test Migration on Staging](#step-4-test-migration-on-staging)
6. [Step 5: Execute Production Migration](#step-5-execute-production-migration)
7. [Step 6: Verify Migration Success](#step-6-verify-migration-success)
8. [Rollback Procedures](#rollback-procedures)
9. [Best Practices](#best-practices)

---

## Pre-Migration Checklist

Before starting the migration:

- [ ] **Schedule maintenance window** (preferably during low-traffic hours, e.g., night time)
- [ ] **Notify users** about potential downtime if necessary
- [ ] **Have rollback plan ready**
- [ ] **Test migrations on development database first**
- [ ] **Review all schema changes** in your feature branch
- [ ] **Ensure you have Neon console access** for manual interventions if needed

---

## Step 1: Backup Production Database

### Option A: Using Neon Console (Recommended)

Neon provides built-in branching which is like Git for your database:

1. **Log into Neon Console**: https://console.neon.tech
2. **Navigate to your project**
3. **Create a backup branch**:
   ```
   Branch name: backup-before-migration-YYYY-MM-DD
   From: main (or your production branch)
   ```
   This creates an instant, zero-cost copy of your production database

### Option B: Using pg_dump (Manual Backup)

If you want a traditional SQL dump:

```bash
# Set your production database URL
export PROD_DATABASE_URL="your-production-neon-url"

# Create backup directory
mkdir -p ./backups

# Full database backup
pg_dump "$PROD_DATABASE_URL" > "./backups/production-backup-$(date +%Y%m%d-%H%M%S).sql"

# Backup specific tables only (if needed)
pg_dump "$PROD_DATABASE_URL" \
  --table='wolfmed_*' \
  > "./backups/production-tables-backup-$(date +%Y%m%d-%H%M%S).sql"

# Backup with data only (no schema)
pg_dump "$PROD_DATABASE_URL" \
  --data-only \
  > "./backups/production-data-backup-$(date +%Y%m%d-%H%M%S).sql"
```

**Note**: For large databases, use compressed backups:
```bash
pg_dump "$PROD_DATABASE_URL" | gzip > "./backups/production-backup-$(date +%Y%m%d-%H%M%S).sql.gz"
```

### Option C: Backup Data as JSON (For reference)

Export critical tables as JSON for easy inspection:

```bash
# Create a Node.js script to export data
node << 'EOF'
const { Pool } = require('@neondatabase/serverless');
const fs = require('fs');

const pool = new Pool({ connectionString: process.env.PROD_DATABASE_URL });

async function backupTable(tableName) {
  const result = await pool.query(`SELECT * FROM ${tableName}`);
  fs.writeFileSync(
    `./backups/${tableName}-${Date.now()}.json`,
    JSON.stringify(result.rows, null, 2)
  );
  console.log(`Backed up ${result.rows.length} rows from ${tableName}`);
}

async function main() {
  const tables = [
    'wolfmed_users',
    'wolfmed_completed_tests',
    'wolfmed_forum_posts',
    'wolfmed_forum_comments'
  ];

  for (const table of tables) {
    await backupTable(table);
  }

  await pool.end();
}

main().catch(console.error);
EOF
```

---

## Step 2: Compare Schemas

### Check Current Production Schema

Connect to production and inspect existing tables:

```bash
# Using psql
psql "$PROD_DATABASE_URL" -c "\dt wolfmed_*"

# List all tables with row counts
psql "$PROD_DATABASE_URL" << 'SQL'
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
  (SELECT count(*) FROM information_schema.columns
   WHERE table_name = tablename) AS column_count
FROM pg_tables
WHERE tablename LIKE 'wolfmed_%'
ORDER BY tablename;
SQL
```

### Review Schema Changes in Your Feature Branch

1. **Switch to your feature branch**:
   ```bash
   git checkout add-new-eductional-path
   ```

2. **Review schema changes**:
   ```bash
   # Compare schema.ts with main branch
   git diff main -- src/server/db/schema.ts
   ```

3. **Document the changes**: Create a list of:
   - New tables being added
   - Modified columns in existing tables
   - New indexes
   - New foreign key constraints
   - Enum changes

---

## Step 3: Generate and Review Migrations

### Using Drizzle Kit

Drizzle ORM uses a "push" model rather than traditional migrations, but you can generate SQL statements for review:

```bash
# On your feature branch with development database
export NEON_DATABASE_URL="your-dev-database-url"

# Generate migration SQL (dry run)
npx drizzle-kit push --verbose

# This will show you exactly what SQL will be executed
```

### Manual Migration SQL Generation

If you need explicit SQL for new tables, extract from schema:

```typescript
// Example: If you added a new table for educational paths
// Create migration script manually

// File: migrations/add-educational-paths-table.sql
CREATE TABLE wolfmed_educational_paths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(256) NOT NULL,
  description TEXT NOT NULL,
  difficulty VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP
);

CREATE INDEX educational_paths_title_idx ON wolfmed_educational_paths(title);
```

---

## Step 4: Test Migration on Staging

### Create a Staging Branch in Neon

1. **In Neon Console**, create a new branch from production:
   ```
   Branch name: staging-migration-test
   From: main (production branch)
   ```

2. **Get the staging connection string** from Neon Console

3. **Test the migration**:

```bash
# Set staging database URL
export NEON_DATABASE_URL="your-staging-branch-url"

# Checkout your feature branch
git checkout add-new-eductional-path

# Push schema to staging
npm run db:push

# Verify tables were created
psql "$NEON_DATABASE_URL" -c "\dt wolfmed_*"
```

4. **Test your application**:
   - Update `.env.local` with staging URL
   - Run your application locally
   - Test all features, especially:
     - New features using new tables
     - Existing features to ensure nothing broke
     - Database queries and relationships

5. **Check for errors**:
   - Review console logs
   - Test CRUD operations
   - Verify foreign key constraints work
   - Test cascade deletes if applicable

---

## Step 5: Execute Production Migration

### Pre-Migration Steps

1. **Schedule maintenance window** (e.g., 2:00 AM - 3:00 AM)

2. **Optional: Enable maintenance mode**:
   ```typescript
   // Add to middleware or layout
   const MAINTENANCE_MODE = process.env.MAINTENANCE_MODE === 'true';

   if (MAINTENANCE_MODE) {
     return <MaintenancePage />;
   }
   ```

3. **Verify backup exists**:
   ```bash
   ls -lh ./backups/
   # Or check Neon Console for backup branch
   ```

### Execute Migration

```bash
# Set production database URL
export NEON_DATABASE_URL="your-production-database-url"

# Checkout feature branch
git checkout add-new-eductional-path

# Push schema changes to production
npm run db:push

# Output will show:
# - Tables being created
# - Columns being added
# - Indexes being created
# - Any errors that occur
```

### Using Drizzle Studio for Visual Verification

```bash
# Open Drizzle Studio connected to production
npm run db:studio

# This opens a web interface at http://localhost:4983
# You can visually inspect:
# - All tables
# - Schema structure
# - Sample data
```

---

## Step 6: Verify Migration Success

### Automated Verification Script

```typescript
// File: scripts/verify-migration.ts
import { db } from './src/server/db';
import { sql } from 'drizzle-orm';

async function verifyMigration() {
  console.log('🔍 Verifying migration...\n');

  // Check if all expected tables exist
  const expectedTables = [
    'wolfmed_users',
    'wolfmed_stripe_payments',
    'wolfmed_stripe_subscriptions',
    'wolfmed_processed_events',
    'wolfmed_completed_tests',
    'wolfmed_tests',
    'wolfmed_procedures',
    'wolfmed_messages',
    'wolfmed_blog_posts',
    'wolfmed_forum_posts',
    'wolfmed_forum_comments',
    // Add your new tables here
    // 'wolfmed_educational_paths',
  ];

  for (const table of expectedTables) {
    try {
      const result = await db.execute(
        sql`SELECT EXISTS (
          SELECT FROM information_schema.tables
          WHERE table_name = ${table}
        )`
      );
      const exists = result.rows[0].exists;
      console.log(`${exists ? '✅' : '❌'} Table ${table}: ${exists ? 'EXISTS' : 'MISSING'}`);
    } catch (error) {
      console.error(`❌ Error checking table ${table}:`, error);
    }
  }

  // Test basic queries
  console.log('\n🧪 Testing basic queries...\n');

  try {
    const userCount = await db.execute(sql`SELECT COUNT(*) FROM wolfmed_users`);
    console.log(`✅ Users table: ${userCount.rows[0].count} records`);

    const testCount = await db.execute(sql`SELECT COUNT(*) FROM wolfmed_tests`);
    console.log(`✅ Tests table: ${testCount.rows[0].count} records`);

    // Add queries for new tables

  } catch (error) {
    console.error('❌ Query test failed:', error);
  }

  console.log('\n✅ Migration verification complete!');
}

verifyMigration().catch(console.error);
```

Run verification:
```bash
npx tsx scripts/verify-migration.ts
```

### Manual Verification

```bash
# Check table existence
psql "$PROD_DATABASE_URL" -c "SELECT tablename FROM pg_tables WHERE tablename LIKE 'wolfmed_%' ORDER BY tablename;"

# Check row counts haven't changed
psql "$PROD_DATABASE_URL" -c "SELECT
  schemaname,
  tablename,
  (xpath('/row/count/text()',
    query_to_xml('SELECT COUNT(*) FROM '||schemaname||'.'||tablename, false, true, '')))[1]::text::int AS row_count
FROM pg_tables
WHERE tablename LIKE 'wolfmed_%'
ORDER BY tablename;"

# Check indexes
psql "$PROD_DATABASE_URL" -c "\di wolfmed_*"

# Check foreign keys
psql "$PROD_DATABASE_URL" -c "SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name LIKE 'wolfmed_%';"
```

### Application-Level Testing

1. **Deploy your application** with the updated schema
2. **Test critical paths**:
   - User authentication and registration
   - Test taking and submission
   - Forum post creation and commenting
   - Stripe payment processing (if applicable)
   - New features using new tables
3. **Monitor error logs** for database-related errors
4. **Check performance** - ensure queries are running efficiently

---

## Rollback Procedures

### If Migration Fails

#### Option 1: Restore from Neon Branch (Fastest)

If you created a Neon backup branch:

1. **In Neon Console**:
   - Go to your backup branch
   - Copy the connection string

2. **Update your application**:
   ```bash
   # Update environment variable to point to backup branch
   export NEON_DATABASE_URL="your-backup-branch-url"
   ```

3. **Or promote backup branch to main**:
   - In Neon Console, you can reset the main branch to the backup state

#### Option 2: Restore from SQL Dump

```bash
# Drop existing database objects (DANGER: This will delete all data)
psql "$PROD_DATABASE_URL" << 'SQL'
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
SQL

# Restore from backup
psql "$PROD_DATABASE_URL" < ./backups/production-backup-YYYYMMDD-HHMMSS.sql

# Or for compressed backup
gunzip -c ./backups/production-backup-YYYYMMDD-HHMMSS.sql.gz | psql "$PROD_DATABASE_URL"
```

#### Option 3: Selective Table Restoration

If only specific tables had issues:

```bash
# Restore specific tables
pg_restore -t wolfmed_new_table ./backups/production-backup-YYYYMMDD-HHMMSS.sql

# Or from SQL dump
psql "$PROD_DATABASE_URL" << 'SQL'
-- Drop problematic tables
DROP TABLE IF EXISTS wolfmed_new_table CASCADE;

-- Then restore from backup file
\i ./backups/production-backup-YYYYMMDD-HHMMSS.sql
SQL
```

### If Application Works but Data is Incorrect

1. **Revert application deployment** to previous version
2. **Investigate data inconsistencies**:
   ```bash
   # Compare row counts
   psql "$PROD_DATABASE_URL" -c "SELECT tablename,
     (xpath('/row/count/text()', query_to_xml('SELECT COUNT(*) FROM '||schemaname||'.'||tablename, false, true, '')))[1]::text::int AS row_count
   FROM pg_tables WHERE tablename LIKE 'wolfmed_%';"
   ```
3. **Use Neon's time-travel feature** (if available on your plan):
   - Neon can restore to any point in time within the retention period
   - In Console: Branches > Create branch > Select "Point in time"

---

## Best Practices

### 1. Use Neon Branching Workflow

Neon branches are free and instant:
- `main` - Production database
- `staging` - Pre-production testing
- `dev` - Development work
- `backup-YYYY-MM-DD` - Point-in-time backups

### 2. Never Skip Testing

Always test migrations on:
1. Local development database
2. Staging branch (copy of production)
3. Then production

### 3. Incremental Migrations

Instead of big-bang migrations:
- Add new tables (non-breaking)
- Deploy application that uses both old and new
- Migrate data gradually
- Remove old tables after verification

### 4. Use Transactions Where Possible

While `drizzle-kit push` doesn't use transactions, manual migrations should:

```sql
BEGIN;
  -- Your migration SQL here
  CREATE TABLE wolfmed_new_table (...);
  -- If anything fails, this will rollback
COMMIT;
```

### 5. Monitor After Migration

Set up alerts for:
- Increased error rates
- Slow query performance
- Failed database connections
- High CPU/memory usage

### 6. Document Everything

Keep a migration log:
```markdown
## Migration: Add Educational Paths Feature
- Date: 2024-01-15 02:00 UTC
- Duration: 15 minutes
- Tables added: wolfmed_educational_paths, wolfmed_user_progress
- Indexes added: 3
- Data migrated: None (new feature)
- Issues: None
- Rollback required: No
```

### 7. Communication

- Notify team before migration
- Post-migration summary
- Update documentation
- Announce completion to users if there was downtime

---

## Quick Reference Commands

```bash
# Backup
pg_dump "$PROD_DATABASE_URL" > backup.sql

# Restore
psql "$PROD_DATABASE_URL" < backup.sql

# Push schema
npm run db:push

# Open Drizzle Studio
npm run db:studio

# List tables
psql "$PROD_DATABASE_URL" -c "\dt wolfmed_*"

# Check table counts
psql "$PROD_DATABASE_URL" -c "SELECT tablename,
  (xpath('/row/count/text()', query_to_xml('SELECT COUNT(*) FROM '||schemaname||'.'||tablename, false, true, '')))[1]::text::int
FROM pg_tables WHERE tablename LIKE 'wolfmed_%';"
```

---

## Troubleshooting

### Error: "relation already exists"

**Cause**: Table already exists in database

**Solution**:
```sql
-- Check if table exists
SELECT tablename FROM pg_tables WHERE tablename = 'wolfmed_your_table';

-- If it exists but schema is different, drop and recreate
DROP TABLE wolfmed_your_table CASCADE;
-- Then rerun migration
```

### Error: "column does not exist"

**Cause**: Application code references columns that don't exist yet

**Solution**:
1. Ensure schema is pushed before deploying application
2. Use feature flags to hide new features until migration is complete

### Error: "deadlock detected"

**Cause**: Concurrent transactions modifying same data

**Solution**:
1. Run migration during low-traffic hours
2. Enable maintenance mode to prevent concurrent access

### Connection Errors

**Cause**: Connection pool exhaustion or network issues

**Solution**:
```typescript
// Increase pool size temporarily
const pool = new Pool({
  connectionString: process.env.NEON_DATABASE_URL,
  max: 20, // Increase from default 10
  connectionTimeoutMillis: 30000, // Increase timeout
});
```

---

## Additional Resources

- **Neon Documentation**: https://neon.tech/docs
- **Drizzle ORM Docs**: https://orm.drizzle.team/docs
- **PostgreSQL Backup Guide**: https://www.postgresql.org/docs/current/backup.html
- **Neon Branching**: https://neon.tech/docs/guides/branching

---

## Migration Checklist Template

Copy this for each migration:

```markdown
## Migration Checklist: [Feature Name]

### Pre-Migration
- [ ] Created backup branch in Neon Console
- [ ] Created SQL dump backup
- [ ] Tested migration on staging
- [ ] Reviewed all schema changes
- [ ] Scheduled maintenance window
- [ ] Notified team/users

### During Migration
- [ ] Verified backup exists
- [ ] Switched to feature branch
- [ ] Ran `npm run db:push`
- [ ] Checked for errors in output
- [ ] Verified tables created

### Post-Migration
- [ ] Ran verification script
- [ ] Tested application functionality
- [ ] Checked error logs
- [ ] Monitored performance
- [ ] Confirmed no data loss
- [ ] Documented migration
- [ ] Notified completion

### Rollback Plan
- [ ] Backup branch ready
- [ ] SQL dump location: ./backups/production-backup-YYYYMMDD.sql
- [ ] Rollback script tested
- [ ] Team knows rollback procedure
```

---

**Remember**: Database migrations are irreversible operations. Always have a backup and test thoroughly before touching production!

**Good luck with your migration! 🚀**
