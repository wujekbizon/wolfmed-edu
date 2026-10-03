import test from 'node:test'
import assert from 'node:assert/strict'
import { generateMindMapFromContext } from '@/helpers/generateMindMapFromContext'
import { MINDMAP_INVALID_MESSAGE } from '@/constants/mindmapGeneration'
import { mapResponse, NO_SOURCE } from './fixtures/generation'

test('no source returns without a model request', async () => {
  const result = await generateMindMapFromContext('krew', '  ', async () => {
    assert.fail('empty context must not reach the model')
  })
  assert.deepEqual(result, { status: 'no_source' })
})

test('model no_source is terminal and never treated as an invalid tree', async () => {
  let calls = 0
  const result = await generateMindMapFromContext('silnik', 'Źródło o krwi', async () => {
    calls++
    return NO_SOURCE
  })
  assert.deepEqual(result, { status: 'no_source' })
  assert.equal(calls, 1)
})

test('a grounded map is generated once with the original topic and passages', async () => {
  let calls = 0
  const result = await generateMindMapFromContext('krew', 'Krew zawiera osocze.', async (prompt) => {
    calls++
    assert.deepEqual(JSON.parse(prompt), { topic: 'krew', source: 'Krew zawiera osocze.' })
    return JSON.stringify(mapResponse())
  })
  assert.equal(calls, 1)
  assert.equal(result.status, 'map')
  if (result.status !== 'map') return
  assert.equal(result.root.children.length, 3)
  assert.equal(result.topicType, 'physiology')
})

test('invalid content enters the repair loop before returning to the action', async () => {
  let calls = 0
  const broken = mapResponse()
  broken.nodes[1]!.notes = 'x'.repeat(2001)
  const result = await generateMindMapFromContext('krew', 'Źródło', async (prompt) => {
    calls++
    if (calls === 1) return JSON.stringify(broken)
    assert.match(prompt, /nodes.1.notes/)
    return JSON.stringify(mapResponse())
  })
  assert.equal(calls, 2)
  assert.equal(result.status, 'map')
})

test('malformed JSON gets one repair attempt, then a form-wide generation error', async () => {
  let calls = 0
  await assert.rejects(generateMindMapFromContext('krew', 'Źródło', async () => {
    calls++
    return '{'
  }), { message: MINDMAP_INVALID_MESSAGE })
  assert.equal(calls, 2)
})

test('provider failures propagate without retries or a false no_source result', async () => {
  let calls = 0
  const failure = new Error('Provider unavailable')
  await assert.rejects(generateMindMapFromContext('krew', 'Źródło', async () => {
    calls++
    throw failure
  }), (error) => error === failure)
  assert.equal(calls, 1)
})

test('a model adding a fourth level succeeds without wasting a repair call', async () => {
  const response = mapResponse()
  for (let depth = 1; depth <= 4; depth++) {
    response.nodes.push({ ...response.nodes[1]!, parentIndex: depth === 1 ? 0 : response.nodes.length - 1 })
  }
  let calls = 0
  const result = await generateMindMapFromContext('krew', 'Źródło', async () => {
    calls++
    return JSON.stringify(response)
  })
  assert.equal(result.status, 'map')
  assert.equal(calls, 1)
})
