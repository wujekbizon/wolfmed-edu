import postgres from 'postgres'
import { loadTestSeed } from './lib/loadTestSeed'
import { synchronizeTestSeed } from './lib/synchronizeTestSeed'

const execute = process.argv.includes('--execute')
const expectedHost = process.argv.find((argument) =>
  argument.startsWith('--expected-host='))?.split('=')[1]
const connectionString = process.env.NEON_DATABASE_URL

if (!connectionString || !expectedHost) {
  throw new Error('NEON_DATABASE_URL and --expected-host are required')
}

const endpoint = new URL(connectionString).hostname
if (endpoint !== expectedHost) throw new Error(`Unexpected Neon endpoint: ${endpoint}`)

const staged = await loadTestSeed()
const sql = postgres(connectionString, { max: 1, onnotice: () => undefined })

try {
  const result = await synchronizeTestSeed(sql, staged, execute)
  process.stdout.write(`${JSON.stringify({
    status: execute ? 'synchronized' : 'dry-run',
    endpoint,
    sourceRows: staged.length,
    ...result,
  }, null, 2)}\n`)
} finally {
  await sql.end()
}
