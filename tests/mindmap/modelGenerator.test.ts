import test from 'node:test'
import assert from 'node:assert/strict'
import { ApiError } from '@google/genai'
import { createMindMapModelGenerator } from '@/helpers/createMindMapModelGenerator'
import { generateMindMapFromContext } from '@/helpers/generateMindMapFromContext'
import { NO_SOURCE, mapResponse } from './fixtures/generation'

test('schema rejection uses JSON mode without losing contents or the shared deadline', async () => {
  let calls = 0
  const signal = new AbortController().signal
  const generate = createMindMapModelGenerator(async (request) => {
    calls++
    assert.equal(request.contents, 'source-grounded prompt')
    assert.equal(request.config?.abortSignal, signal)
    assert.equal(request.config?.responseMimeType, 'application/json')
    if (calls === 1) {
      assert.ok(request.config?.responseSchema)
      throw new ApiError({ status: 400, message: 'INVALID_ARGUMENT' })
    }
    assert.equal(request.config?.responseSchema, undefined)
    return { text: NO_SOURCE }
  }, signal)
  assert.equal(await generate('source-grounded prompt'), NO_SOURCE)
  assert.equal(calls, 2)
})

test('fallback output still passes through full validation and one repair', async () => {
  let calls = 0
  const generate = createMindMapModelGenerator(async (request) => {
    calls++
    if (calls === 1) throw new ApiError({ status: 400, message: 'INVALID_ARGUMENT' })
    assert.equal(request.config?.responseSchema, undefined)
    if (calls === 2) return { text: '{}' }
    return { text: JSON.stringify(mapResponse()) }
  }, new AbortController().signal)
  const result = await generateMindMapFromContext('krew', 'Source', generate)
  assert.equal(result.status, 'map')
  assert.equal(calls, 3)
})

test('non-schema failures and an aborted request never trigger fallback', async () => {
  for (const status of [401, 403, 429, 503]) {
    let calls = 0
    const generate = createMindMapModelGenerator(async () => {
      calls++
      throw new ApiError({ status, message: 'Provider failure' })
    }, new AbortController().signal)
    await assert.rejects(generate('Source'))
    assert.equal(calls, 1)
  }
  let calls = 0
  const controller = new AbortController()
  controller.abort()
  const generate = createMindMapModelGenerator(async () => {
    calls++
    throw new ApiError({ status: 400, message: 'INVALID_ARGUMENT' })
  }, controller.signal)
  await assert.rejects(generate('Source'))
  assert.equal(calls, 1)
})

test('a second 400 is terminal', async () => {
  let calls = 0
  const generate = createMindMapModelGenerator(async () => {
    calls++
    throw new ApiError({ status: 400, message: 'INVALID_ARGUMENT' })
  }, new AbortController().signal)
  await assert.rejects(generate('Source'))
  assert.equal(calls, 2)
})
