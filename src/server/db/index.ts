import { Pool } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-serverless'
import * as schema from './schema'

if (!process.env.NEON_DATABASE_URL) {
  throw new Error('NEON_DATABASE_URL is not defined')
}

const pool = new Pool({
  connectionString: process.env.NEON_DATABASE_URL,
  max: 10, // Maximum number of connections in the pool
  idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
  connectionTimeoutMillis: 10000, // Connection timeout after 10 seconds
  maxUses: 7500, // Maximum number of times a connection can be used before being destroyed
})

pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err)
})

export const db = drizzle(pool, { schema })
