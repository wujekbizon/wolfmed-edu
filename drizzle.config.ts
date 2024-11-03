import { defineConfig } from 'drizzle-kit'
import * as dotenv from 'dotenv'
dotenv.config()

if (!process.env.NEON_DATABASE_URL) {
  throw new Error('NEON_DATABASE_URL is not defined')
}

export default defineConfig({
  schema: './src/server/db/schema.ts',
  dialect: 'postgresql',
  out: './drizzle',
  dbCredentials: {
    url: process.env.NEON_DATABASE_URL,
  },
  verbose: true,
  strict: true,
  tablesFilter: ['wolfmed_*'],
})
