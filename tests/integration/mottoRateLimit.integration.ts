import assert from 'node:assert/strict'
import { mkdirSync, writeFileSync, unlinkSync } from 'node:fs'
import pg from 'pg'
import { drizzle } from 'drizzle-orm/node-postgres'
import { and, eq, inArray } from 'drizzle-orm'
import { cache } from 'react'
import { users } from '@/server/db/schema'
import { UpdateMottoSchema } from '@/server/schema'
import { fromErrorToFormState, toFormState } from '@/helpers/toFormState'
import { extractSource, loadSource } from '../support/loadSource'
import type { MottoAction } from '../support/rateLimitTypes'
import { liveLimiter } from './support/liveLimiter'

const userId = process.argv[2] ?? ''
assert.ok(userId.startsWith('user_'), 'Usage: pnpm exec tsx tests/integration/mottoRateLimit.integration.ts user_ID --live')
const live = liveLimiter('motto')
assert.ok(process.env.NEON_DATABASE_URL, 'Configure NEON_DATABASE_URL in .env')
const pool = new pg.Pool({ connectionString: process.env.NEON_DATABASE_URL, max: 3, connectionTimeoutMillis: 10000 })
const db = drizzle(pool)
const readMotto = async () => {
  const rows = await db.select({ motto: users.motto }).from(users).where(eq(users.userId, userId))
  assert.equal(rows.length, 1, 'Expected exactly one target account')
  return rows[0]!.motto
}
const { updateMottoByUserId } = loadSource<{
  updateMottoByUserId: (id: string, motto: string) => Promise<void>
}>(extractSource(new URL('../../src/server/queries.ts', import.meta.url), 'updateMottoByUserId'), { db, users, eq, cache })
const source = extractSource(new URL('../../src/actions/actions.ts', import.meta.url), 'updateMotto')
const markers: string[] = []
const backup = `outputs/rate-limit-tests/motto-${live.runId}.local.json`
let original: string | undefined
let touched = false
try {
  original = await readMotto()
  mkdirSync('outputs/rate-limit-tests', { recursive: true })
  writeFileSync(backup, JSON.stringify({ userId, motto: original }))
  for (const mode of ['old', 'fixed'] as const) {
    let writes = 0
    const { updateMotto } = loadSource<{ updateMotto: MottoAction }>(source, {
      auth: async () => ({ userId }), checkRateLimit: live.check(mode),
      UpdateMottoSchema, fromErrorToFormState, toFormState, revalidatePath: () => {},
      updateMottoByUserId: async (id: string, motto: string) => {
        assert.equal(id, userId)
        touched = true
        await updateMottoByUserId(id, motto)
        writes++
      },
    })
    const batch = await Promise.allSettled(Array.from({ length: 10 }, (_, index) => {
      const motto = `Motto smoke ${live.runId} ${mode} ${index}`
      markers.push(motto)
      const form = new FormData()
      form.set('motto', motto)
      return updateMotto(toFormState('UNSET', ''), form)
    }))
    const responses = batch.map(item => {
      assert.equal(item.status, 'fulfilled', 'Action threw unexpectedly')
      return (item as PromiseFulfilledResult<Awaited<ReturnType<MottoAction>>>).value
    })
    const accepted = responses.filter(item => item.status === 'SUCCESS').length
    const blocked = responses.filter(item => item.status === 'ERROR' && item.message.startsWith('Zbyt wiele')).length
    assert.equal(accepted + blocked, 10, 'Unexpected validation/database failure')
    assert.equal(writes, accepted)
    assert.ok(markers.includes(await readMotto()), 'Motto writes not persisted')
    console.log(JSON.stringify({ mode, concurrent: 10, limit: 5, accepted, blocked, dbUpdates: writes }))
    if (mode === 'fixed') assert.equal(accepted, 5)
    else console.log(`Legacy race reproduced: ${accepted > 5}; live timing may vary`)
  }
} finally {
  try {
    if (original !== undefined) {
      if (touched) {
        await db.update(users).set({ motto: original }).where(and(eq(users.userId, userId), inArray(users.motto, markers)))
      }
      assert.equal(await readMotto(), original, `Original motto not restored; backup: ${backup}`)
      unlinkSync(backup)
      console.log('Original motto restored and verified; limit unchanged')
    }
  } finally {
    try { await live.cleanup() } finally { await pool.end() }
  }
}
