import { Pool, Client} from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-serverless'
import * as schema from './schema'

if (!process.env.NEON_DATABASE_URL) {
  throw new Error('NEON_DATABASE_URL is not defined')
}

const pool = new Pool({
  connectionString: process.env.NEON_DATABASE_URL,
  max: 3,
  idleTimeoutMillis: 5000,
  connectionTimeoutMillis: 5000, 
  maxUses: 7500,
})

pool.on('error', (err: Error, client: Client) => {
  console.error('Unexpected error on idle client', err)
})

export const db = drizzle(pool, { schema })
