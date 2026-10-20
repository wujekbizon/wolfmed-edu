import assert from 'node:assert/strict'
import { mock, test } from 'node:test'
import { PracticeError } from '@/server/learning/PracticeError'
import { practiceView } from '../companion/fixtures/practiceView'

let userId: string | null = null
let denied = false
let reads = 0
let checks = 0
const session = practiceView()
mock.module('@clerk/nextjs/server', { namedExports: { auth: async () => ({ userId }) } })
mock.module('../../src/server/learning/requireCategoryAccess.ts', {
  namedExports: { requireCategoryAccess: async () => {
    checks++
    if (denied) throw new PracticeError('Brak dostępu do tej kategorii.')
    return userId
  } },
})
mock.module('../../src/server/learning/config.ts', {
  namedExports: { isPracticeEnabled: () => true },
})
mock.module('../../src/server/learning/readSession.ts', {
  namedExports: { readPracticeSession: async (viewer: string, category: string) => {
    reads++
    assert.equal(viewer, 'user-1')
    assert.equal(category, 'opiekun-medyczny')
    return session
  } },
})
const { GET } = await import('../../src/app/api/learning/progress/route')
const url = 'http://localhost/api/learning/progress?userId=user-1&category=opiekun-medyczny'

test('GET progress authenticates and authorizes before reading', async () => {
  const unauthorized = await GET(new Request(url))
  assert.equal(unauthorized.status, 401)
  assert.equal(unauthorized.headers.get('Cache-Control'), 'private, no-store')
  assert.equal(reads, 0)
  assert.equal(checks, 0)
  userId = 'user-2'
  assert.equal((await GET(new Request(url))).status, 401)
  assert.equal(reads, 0)
  assert.equal(checks, 0)
  userId = 'user-1'
  assert.equal((await GET(new Request(url.replace('&category=opiekun-medyczny', '')))).status, 400)
  assert.equal(checks, 0)
  denied = true
  assert.equal((await GET(new Request(url))).status, 403)
  assert.equal(reads, 0)
  denied = false
  const success = await GET(new Request(url))
  assert.equal(success.status, 200)
  assert.deepEqual(await success.json(), session)
  assert.equal(success.headers.get('Cache-Control'), 'private, no-store')
  assert.equal(checks, 2)
  assert.equal(reads, 1)
})
