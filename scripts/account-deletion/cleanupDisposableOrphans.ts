import type postgres from 'postgres'
import { disposableTables } from './disposableTables'

export async function cleanupDisposableOrphans(
  tx: postgres.TransactionSql
): Promise<void> {
  for (const table of disposableTables) {
    await tx.unsafe(`
      DELETE FROM ${table} owned
      WHERE NOT EXISTS (
        SELECT 1 FROM wolfmed_users users
        WHERE users."userId" = owned."userId"
      )
    `)
  }

  await tx.unsafe(`
    UPDATE wolfmed_blog_posts posts
    SET "authorId" = 'deleted:' || gen_random_uuid()::text,
        "authorName" = 'Usunięty użytkownik',
        "updatedAt" = now()
    WHERE NOT EXISTS (
      SELECT 1 FROM wolfmed_users users
      WHERE users."userId" = posts."authorId"
    )
  `)
}
