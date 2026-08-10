import postgres from "postgres"

const connectionString = process.env.NEON_DATABASE_URL
if (!connectionString) throw new Error("NEON_DATABASE_URL is not defined")

const sql = postgres(connectionString, { max: 1 })

try {
  await sql.begin(async (tx) => {
    await tx.unsafe('LOCK TABLE wolfmed_user_cells_list IN ACCESS EXCLUSIVE MODE')

    const divergent = await tx.unsafe<{ userId: string; rowCount: number }[]>(`
      SELECT "userId", COUNT(*)::int AS "rowCount"
      FROM wolfmed_user_cells_list
      GROUP BY "userId"
      HAVING COUNT(*) > 1
         AND COUNT(DISTINCT md5(jsonb_build_array(cells, "order")::text)) > 1
    `)

    if (divergent.length > 0) {
      throw new Error(
        `Divergent duplicate cell boards require manual review: ${divergent
          .map((row) => row.userId)
          .join(", ")}`
      )
    }

    const removed = await tx.unsafe<{ id: string }[]>(`
      WITH ranked AS (
        SELECT id,
          ROW_NUMBER() OVER (
            PARTITION BY "userId"
            ORDER BY "updatedAt" DESC, "createdAt" DESC, id DESC
          ) AS position
        FROM wolfmed_user_cells_list
      )
      DELETE FROM wolfmed_user_cells_list
      WHERE id IN (SELECT id FROM ranked WHERE position > 1)
      RETURNING id
    `)

    await tx.unsafe(`
      ALTER TABLE wolfmed_user_cells_list
      ADD COLUMN IF NOT EXISTS version integer NOT NULL DEFAULT 0
    `)

    await tx.unsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS user_cells_list_user_id_uq
      ON wolfmed_user_cells_list ("userId")
    `)

    await tx.unsafe('DROP INDEX IF EXISTS user_cells_list_user_id_idx')

    console.log(`Removed duplicate rows: ${removed.length}`)
    console.log("Added cells version column and unique user constraint")
  })
} finally {
  await sql.end()
}
