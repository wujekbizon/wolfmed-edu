import type postgres from 'postgres'
import { disposableTables } from './disposableTables'

export async function getOrphanCounts(sql: postgres.Sql) {
  return Promise.all(disposableTables.map(async (table) => {
    const [row] = await sql.unsafe<{ count: number }[]>(`
      SELECT COUNT(*)::int AS count FROM ${table} owned
      WHERE NOT EXISTS (
        SELECT 1 FROM wolfmed_users users
        WHERE users."userId" = owned."userId"
      )
    `)
    return [table, row?.count ?? 0] as const
  }))
}
