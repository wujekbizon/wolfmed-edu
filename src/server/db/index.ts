import { attachDatabasePool } from '@vercel/functions'
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema'

if (!process.env.NEON_DATABASE_URL) {
  throw new Error('NEON_DATABASE_URL is not defined')
}

const pool = new Pool({
  connectionString: process.env.NEON_DATABASE_URL,
  max: 3,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
})

attachDatabasePool(pool)

pool.on('error', (err: Error) => {
  console.error('Unexpected error on idle client', err)
})

export const db = drizzle(pool, { schema })
