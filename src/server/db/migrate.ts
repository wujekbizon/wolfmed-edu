import { drizzle } from 'drizzle-orm/neon-http'
import { migrate } from 'drizzle-orm/neon-http/migrator'
import { neon } from '@neondatabase/serverless'

async function main() {
  try {
    console.log('Starting migration...')

    if (!process.env.NEON_DATABASE_URL) {
      throw new Error('NEON_DATABASE_URL is not defined')
    }

    const sql = neon(process.env.NEON_DATABASE_URL)
    const db = drizzle(sql)

    await migrate(db, { migrationsFolder: 'drizzle' })

    console.log('Migration completed successfully')
    process.exit(0)
  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  }
}

main()
