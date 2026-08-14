import type postgres from 'postgres'

export async function cleanupMemoryOrphans(
  tx: postgres.TransactionSql
): Promise<void> {
  await tx.unsafe(`
    UPDATE wolfmed_mem_facts facts
    SET user_id = 'deleted:' || gen_random_uuid()::text,
        content = '[erased]', content_hash = fact_id,
        embedding = NULL, metadata = NULL, status = 'revoked'
    WHERE user_id NOT LIKE 'deleted:%'
      AND NOT EXISTS (
        SELECT 1 FROM wolfmed_users users
        WHERE users."userId" = facts.user_id
      )
  `)
  await tx.unsafe(`
    UPDATE wolfmed_mem_episodes episodes
    SET user_id = 'deleted:' || gen_random_uuid()::text,
        title = '[erased]', summary = '[erased]', outcome = '[erased]',
        key_steps = NULL, artifacts = NULL, embedding = NULL, status = 'revoked'
    WHERE user_id NOT LIKE 'deleted:%'
      AND NOT EXISTS (
        SELECT 1 FROM wolfmed_users users
        WHERE users."userId" = episodes.user_id
      )
  `)
  await tx.unsafe(`DELETE FROM wolfmed_mem_preferences preferences WHERE NOT EXISTS (
    SELECT 1 FROM wolfmed_users users WHERE users."userId" = preferences.user_id
  )`)
  await tx.unsafe(`DELETE FROM wolfmed_mem_traces traces WHERE NOT EXISTS (
    SELECT 1 FROM wolfmed_users users WHERE users."userId" = traces.user_id
  )`)
  await tx.unsafe(`DELETE FROM wolfmed_lib_chunks chunks WHERE NOT EXISTS (
    SELECT 1 FROM wolfmed_users users WHERE users."userId" = chunks.user_id
  )`)
  await tx.unsafe(`UPDATE wolfmed_mem_deletion_events
    SET user_id = 'deleted:' || gen_random_uuid()::text
    WHERE user_id NOT LIKE 'deleted:%'`)
}
