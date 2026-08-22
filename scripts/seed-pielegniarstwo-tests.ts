import 'dotenv/config'
import { readFile } from 'node:fs/promises'
import postgres from 'postgres'
import { normalizeMigrationDate } from './production-migration/normalizeMigrationDate'
import { synchronizeTestSeed } from './production-migration/synchronizeTestSeed'
import type {
  StagedTestRecord,
  TestMigrationRecord,
} from './production-migration/testMigrationTypes'

const execute = process.argv.includes('--execute')
const expectedHost = process.argv.find((arg) => arg.startsWith('--expected-host='))
  ?.split('=')[1]
const connectionString = process.env.NEON_DATABASE_URL

if (!connectionString || !expectedHost) {
  throw new Error('NEON_DATABASE_URL and --expected-host are required')
}
if (new URL(connectionString).hostname !== expectedHost) {
  throw new Error('Unexpected Neon endpoint')
}

const source = JSON.parse(await readFile('data/tests.json', 'utf8')) as
  TestMigrationRecord[]
const ids = new Set<string>()
const staged: StagedTestRecord[] = source.map((record) => {
  if (!record.id || ids.has(record.id)) {
    throw new Error(`Missing or duplicate test ID: ${record.id || '(empty)'}`)
  }
  ids.add(record.id)
  if (!['opiekun-medyczny', 'pielegniarstwo'].includes(record.meta?.course)) {
    throw new Error(`Noncanonical course on ${record.id}: ${record.meta?.course}`)
  }
  if (!record.meta.category || !record.data?.question || !record.data.answers?.length) {
    throw new Error(`Invalid test record: ${record.id}`)
  }
  return {
    id: record.id,
    meta: record.meta,
    data: record.data,
    created_at: normalizeMigrationDate(record.createdAt),
    updated_at: normalizeMigrationDate(record.updatedAt),
  }
})

const sql = postgres(connectionString, { max: 1, onnotice: () => undefined })

try {
  const result = await synchronizeTestSeed(sql, staged, execute)

  process.stdout.write(`${JSON.stringify({
    status: execute ? 'synchronized' : 'dry-run',
    endpoint: expectedHost,
    sourceRows: staged.length,
    ...result,
  }, null, 2)}\n`)
} finally {
  await sql.end()
}
