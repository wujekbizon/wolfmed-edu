import test from 'node:test'
import assert from 'node:assert/strict'
import { parseMindMapGeneration } from '@/helpers/parseMindMapGeneration'
import { generateMindMapFromContext } from '@/helpers/generateMindMapFromContext'
import { mapResponse } from './fixtures/generation'

test('excess tags and an unknown display category do not reject a grounded map', async () => {
  const response = mapResponse()
  response.nodes[1]!.tags = [' krew ', 'krew', '', 'osocze', 'skład', 'funkcje']
  response.nodes[2]!.category = 'hematology'
  let calls = 0
  const result = await generateMindMapFromContext('krew', 'Source', async () => {
    calls++
    return JSON.stringify(response)
  })
  assert.equal(result.status, 'map')
  assert.equal(calls, 1)
  if (result.status !== 'map') return
  assert.deepEqual(result.root.children[0]!.metadata?.tags, ['krew', 'osocze', 'skład'])
  assert.equal(result.root.children[1]!.metadata?.category, 'other')
  assert.equal(result.root.children[1]!.metadata?.notes, response.nodes[2]!.notes)
})

test('category casing, long tags and an unknown topic type are normalized', () => {
  const response = mapResponse()
  response.topicType = 'hematology'
  response.nodes[1]!.category = ' PHYSIOLOGY '
  response.nodes[1]!.tags = ['x'.repeat(80)]
  const result = parseMindMapGeneration(JSON.stringify(response))
  assert.equal(result.status, 'map')
  if (result.status !== 'map') return
  assert.equal(result.topicType, 'generic')
  assert.equal(result.root.children[0]!.metadata?.category, 'physiology')
  assert.equal(result.root.children[0]!.metadata?.tags?.[0]?.length, 40)
})

test('optional display metadata stays compatible with the original stored schema', () => {
  const response = mapResponse()
  const nodes = response.nodes.map(({ label, parentIndex, notes }) => ({ label, parentIndex, notes }))
  const result = parseMindMapGeneration(JSON.stringify({ ...response, nodes }))
  assert.equal(result.status, 'map')
})

test('malformed display metadata uses safe defaults', () => {
  const response = mapResponse()
  const nodes = response.nodes.map(node => ({ ...node, tags: null, category: 42 }))
  const result = parseMindMapGeneration(JSON.stringify({ ...response, nodes }))
  assert.equal(result.status, 'map')
  if (result.status !== 'map') return
  assert.deepEqual(result.root.metadata?.tags, [])
  assert.equal(result.root.metadata?.category, 'other')
})

test('malformed medical content is still rejected before normalization', () => {
  const response = mapResponse()
  const nodes = response.nodes.map(node => ({ ...node, notes: 42 }))
  assert.throws(() => parseMindMapGeneration(JSON.stringify({ ...response, nodes })), /notes/)
})
