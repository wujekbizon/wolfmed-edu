import type postgres from 'postgres'
import type { StagedTestSeedRecord } from './testSeedTypes'

const BATCH_SIZE = 500

export async function synchronizeTestSeed(
  sql: postgres.Sql,
  staged: StagedTestSeedRecord[],
  execute: boolean,
) {
  return sql.begin(async (transaction) => {
    await transaction`SET LOCAL lock_timeout = '5s'`
    await transaction`SET LOCAL statement_timeout = '10min'`
    await transaction`CREATE TEMP TABLE test_seed (
      id uuid PRIMARY KEY, meta jsonb NOT NULL, data jsonb NOT NULL,
      created_at timestamp, updated_at timestamp
    ) ON COMMIT DROP`

    for (let index = 0; index < staged.length; index += BATCH_SIZE) {
      const batch = staged.slice(index, index + BATCH_SIZE)
      const json = batch as unknown as Parameters<typeof transaction.json>[0]
      await transaction`INSERT INTO test_seed
        SELECT source.id::uuid, source.meta, source.data,
          source.created_at::timestamp, source.updated_at::timestamp
        FROM jsonb_to_recordset(${transaction.json(json)}::jsonb) AS source(
          id text, meta jsonb, data jsonb, created_at text, updated_at text
        )`
    }

    const [before] = await transaction`SELECT
      COUNT(*) FILTER (WHERE target.id IS NULL)::int AS inserts,
      COUNT(*) FILTER (WHERE target.id IS NOT NULL AND
        (target.meta IS DISTINCT FROM source.meta OR
         target.data IS DISTINCT FROM source.data))::int AS updates,
      COUNT(*) FILTER (WHERE target.id IS NOT NULL AND
        target.meta IS NOT DISTINCT FROM source.meta AND
        target.data IS NOT DISTINCT FROM source.data)::int AS unchanged,
      (SELECT COUNT(*)::int FROM wolfmed_tests target WHERE NOT EXISTS (
        SELECT 1 FROM test_seed source WHERE source.id = target.id
      )) AS extras
      FROM test_seed source LEFT JOIN wolfmed_tests target ON target.id = source.id`

    if (execute) {
      await transaction`INSERT INTO wolfmed_tests
        (id, meta, data, "createdAt", "updatedAt")
        SELECT id, meta, data, created_at, updated_at FROM test_seed
        ON CONFLICT (id) DO UPDATE SET meta = excluded.meta, data = excluded.data,
          "createdAt" = COALESCE(excluded."createdAt", wolfmed_tests."createdAt"),
          "updatedAt" = COALESCE(excluded."updatedAt", wolfmed_tests."updatedAt")
        WHERE wolfmed_tests.meta IS DISTINCT FROM excluded.meta
          OR wolfmed_tests.data IS DISTINCT FROM excluded.data`
    }

    const [after] = await transaction`SELECT
      (SELECT COUNT(*)::int FROM wolfmed_tests) AS database_rows,
      COUNT(*) FILTER (WHERE NOT EXISTS (
        SELECT 1 FROM wolfmed_tests target WHERE target.id = source.id
      ))::int AS missing,
      COUNT(*) FILTER (WHERE EXISTS (
        SELECT 1 FROM wolfmed_tests target WHERE target.id = source.id AND
          (target.meta IS DISTINCT FROM source.meta OR target.data IS DISTINCT FROM source.data)
      ))::int AS mismatched FROM test_seed source`

    if (execute && (after?.missing !== 0 || after.mismatched !== 0)) {
      throw new Error('Test synchronization verification failed')
    }
    return { before, after }
  })
}
