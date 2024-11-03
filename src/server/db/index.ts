import { Pool } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-serverless'
import * as schema from './schema'

if (!process.env.NEON_DATABASE_URL) {
  throw new Error('NEON_DATABASE_URL is not defined')
}

const pool = new Pool({ connectionString: process.env.NEON_DATABASE_URL })
export const db = drizzle(pool, { schema })
