/**
 * Quiz 2.0 hard reset: wipes all challenge completions and procedure badges
 * so every user re-earns them under the new 4-challenge regime.
 *
 * Requires NEON_DATABASE_URL in .env.local (same as db:push / seed scripts).
 * Run locally: npx tsx scripts/reset-challenge-progress.ts
 */
import * as dotenv from "dotenv"
import postgres from "postgres"

dotenv.config({ path: ".env.local" })
dotenv.config()

const connectionString =
  process.env.NEON_DATABASE_URL ?? process.env.DATABASE_URL
if (!connectionString) {
  console.error("NEON_DATABASE_URL is not set (checked .env.local and .env)")
  process.exit(1)
}

const sql = postgres(connectionString, { max: 1 })

async function main() {
  const completions =
    await sql`SELECT count(*)::int AS count FROM wolfmed_challenge_completions`
  const badges =
    await sql`SELECT count(*)::int AS count FROM wolfmed_procedure_badges`

  console.log(
    `Deleting ${completions[0]?.count ?? 0} challenge completions and ${badges[0]?.count ?? 0} badges…`
  )

  await sql`TRUNCATE TABLE wolfmed_challenge_completions`
  await sql`TRUNCATE TABLE wolfmed_procedure_badges`

  console.log("Done. All users start fresh with the 4-challenge badge.")
  await sql.end()
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
