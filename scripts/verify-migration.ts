import { db } from '../src/server/db'
import { sql } from 'drizzle-orm'

/**
 * Migration Verification Script
 *
 * This script verifies that all expected tables exist in the database
 * and performs basic health checks after a migration.
 *
 * Usage: npx tsx scripts/verify-migration.ts
 */

const EXPECTED_TABLES = [
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
  // Add your new tables here when migrating
  // 'wolfmed_educational_paths',
  // 'wolfmed_user_progress',
]

async function checkTableExists(tableName: string): Promise<boolean> {
  try {
    const result = await db.execute(
      sql.raw(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables
          WHERE table_name = '${tableName}'
        ) as exists
      `)
    )
    return result.rows[0]?.exists === true
  } catch (error) {
    console.error(`Error checking table ${tableName}:`, error)
    return false
  }
}

async function getTableRowCount(tableName: string): Promise<number> {
  try {
    const result = await db.execute(sql.raw(`SELECT COUNT(*) FROM ${tableName}`))
    return parseInt(result.rows[0]?.count as string) || 0
  } catch (error) {
    console.error(`Error counting rows in ${tableName}:`, error)
    return -1
  }
}

async function getTableColumns(tableName: string): Promise<string[]> {
  try {
    const result = await db.execute(
      sql.raw(`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = '${tableName}'
        ORDER BY ordinal_position
      `)
    )
    return result.rows.map((row: any) => row.column_name)
  } catch (error) {
    console.error(`Error getting columns for ${tableName}:`, error)
    return []
  }
}

async function getTableIndexes(tableName: string): Promise<string[]> {
  try {
    const result = await db.execute(
      sql.raw(`
        SELECT indexname
        FROM pg_indexes
        WHERE tablename = '${tableName}'
        ORDER BY indexname
      `)
    )
    return result.rows.map((row: any) => row.indexname)
  } catch (error) {
    console.error(`Error getting indexes for ${tableName}:`, error)
    return []
  }
}

async function verifyMigration() {
  console.log('🔍 Starting Migration Verification...\n')
  console.log('=' .repeat(60))
  console.log('DATABASE MIGRATION VERIFICATION REPORT')
  console.log('=' .repeat(60))
  console.log(`Timestamp: ${new Date().toISOString()}\n`)

  let allTablesExist = true
  let hasErrors = false

  // 1. Check Table Existence
  console.log('📋 CHECKING TABLE EXISTENCE')
  console.log('-'.repeat(60))

  for (const tableName of EXPECTED_TABLES) {
    const exists = await checkTableExists(tableName)
    const status = exists ? '✅' : '❌'
    console.log(`${status} ${tableName.padEnd(35)} ${exists ? 'EXISTS' : 'MISSING'}`)

    if (!exists) {
      allTablesExist = false
      hasErrors = true
    }
  }

  console.log('')

  // 2. Check Row Counts
  console.log('📊 TABLE ROW COUNTS')
  console.log('-'.repeat(60))

  const tableCounts: Record<string, number> = {}

  for (const tableName of EXPECTED_TABLES) {
    const exists = await checkTableExists(tableName)
    if (!exists) continue

    const count = await getTableRowCount(tableName)
    tableCounts[tableName] = count

    const status = count >= 0 ? '✅' : '❌'
    const countStr = count >= 0 ? count.toLocaleString() : 'ERROR'

    console.log(`${status} ${tableName.padEnd(35)} ${countStr.padStart(10)} rows`)

    if (count < 0) hasErrors = true
  }

  console.log('')

  // 3. Check Critical Tables Have Data (warning, not error)
  console.log('⚠️  DATA VALIDATION WARNINGS')
  console.log('-'.repeat(60))

  const criticalTables = ['wolfmed_users', 'wolfmed_tests', 'wolfmed_procedures']
  let hasWarnings = false

  for (const tableName of criticalTables) {
    const count = tableCounts[tableName]
    if (count === 0) {
      console.log(`⚠️  ${tableName} has 0 rows (expected to have data)`)
      hasWarnings = true
    }
  }

  if (!hasWarnings) {
    console.log('✅ All critical tables have data')
  }

  console.log('')

  // 4. Sample Detailed Table Info
  console.log('🔎 DETAILED TABLE INFORMATION (Sample)')
  console.log('-'.repeat(60))

  const sampleTables = ['wolfmed_users', 'wolfmed_forum_posts']

  for (const tableName of sampleTables) {
    const exists = await checkTableExists(tableName)
    if (!exists) continue

    console.log(`\n📄 ${tableName}`)
    console.log('   Columns:')
    const columns = await getTableColumns(tableName)
    columns.forEach((col) => console.log(`     - ${col}`))

    console.log('   Indexes:')
    const indexes = await getTableIndexes(tableName)
    if (indexes.length === 0) {
      console.log('     (no indexes)')
    } else {
      indexes.forEach((idx) => console.log(`     - ${idx}`))
    }
  }

  console.log('')

  // 5. Test Basic Queries
  console.log('🧪 TESTING BASIC QUERIES')
  console.log('-'.repeat(60))

  const queryTests = [
    {
      name: 'Select from users',
      query: sql`SELECT id, userId, username FROM wolfmed_users LIMIT 1`,
    },
    {
      name: 'Select from tests',
      query: sql`SELECT id, category FROM wolfmed_tests LIMIT 1`,
    },
    {
      name: 'Join forum posts with comments',
      query: sql`
        SELECT p.id, p.title, COUNT(c.id) as comment_count
        FROM wolfmed_forum_posts p
        LEFT JOIN wolfmed_forum_comments c ON p.id = c."postId"
        GROUP BY p.id, p.title
        LIMIT 1
      `,
    },
  ]

  for (const test of queryTests) {
    try {
      const result = await db.execute(test.query)
      console.log(`✅ ${test.name.padEnd(40)} SUCCESS (${result.rows.length} rows)`)
    } catch (error) {
      console.log(`❌ ${test.name.padEnd(40)} FAILED`)
      console.error(`   Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      hasErrors = true
    }
  }

  console.log('')

  // 6. Check Foreign Key Constraints
  console.log('🔗 CHECKING FOREIGN KEY CONSTRAINTS')
  console.log('-'.repeat(60))

  try {
    const result = await db.execute(
      sql.raw(`
        SELECT
          tc.table_name,
          kcu.column_name,
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name,
          rc.delete_rule
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
        JOIN information_schema.referential_constraints AS rc
          ON tc.constraint_name = rc.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY'
          AND tc.table_name LIKE 'wolfmed_%'
        ORDER BY tc.table_name, kcu.column_name
      `)
    )

    if (result.rows.length === 0) {
      console.log('⚠️  No foreign key constraints found')
    } else {
      result.rows.forEach((row: any) => {
        console.log(
          `✅ ${row.table_name}.${row.column_name} -> ${row.foreign_table_name}.${row.foreign_column_name} (${row.delete_rule})`
        )
      })
    }
  } catch (error) {
    console.log('❌ Failed to check foreign keys')
    console.error(`   Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    hasErrors = true
  }

  console.log('')

  // Final Summary
  console.log('=' .repeat(60))
  console.log('VERIFICATION SUMMARY')
  console.log('=' .repeat(60))

  if (!allTablesExist) {
    console.log('❌ FAILED: Some expected tables are missing')
  } else {
    console.log('✅ All expected tables exist')
  }

  if (hasErrors) {
    console.log('❌ FAILED: Errors encountered during verification')
  } else {
    console.log('✅ No errors encountered')
  }

  if (hasWarnings) {
    console.log('⚠️  WARNING: Some tables have unexpected data states')
  }

  console.log('')

  if (!hasErrors && allTablesExist) {
    console.log('🎉 MIGRATION VERIFICATION PASSED!')
    console.log('   Your database is ready for production use.')
  } else {
    console.log('💥 MIGRATION VERIFICATION FAILED!')
    console.log('   Please review the errors above before proceeding.')
    console.log('   Consider rolling back the migration if issues are critical.')
  }

  console.log('')
  console.log('=' .repeat(60))

  // Exit with appropriate code
  process.exit(hasErrors || !allTablesExist ? 1 : 0)
}

// Run verification
verifyMigration().catch((error) => {
  console.error('💥 FATAL ERROR during verification:')
  console.error(error)
  process.exit(1)
})
