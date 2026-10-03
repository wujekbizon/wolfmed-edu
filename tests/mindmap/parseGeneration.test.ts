import test from 'node:test'
import assert from 'node:assert/strict'
import { parseMindMapGeneration } from '@/helpers/parseMindMapGeneration'
import { parseMindMapCellContent } from '@/helpers/parseMindMapCellContent'
import { collapseBelowDepth } from '@/lib/mindmap/treeOps'
import { mapResponse, NO_SOURCE } from './fixtures/generation'

test('explicit no_source needs no map validation', () => {
  assert.deepEqual(parseMindMapGeneration(NO_SOURCE), { status: 'no_source' })
})

test('malformed or contradictory response envelopes are rejected', () => {
  for (const response of [
    null,
    { status: 'map', topicType: 'physiology', nodes: [] },
    { status: 'no_source', topicType: null, nodes: mapResponse().nodes },
    { status: 'no_source' },
    { status: 'unknown', topicType: null, nodes: [] },
    mapResponse().nodes,
  ]) {
    assert.throws(() => parseMindMapGeneration(JSON.stringify(response)))
  }
})

test('raw label types are checked before normalization', () => {
  const response = mapResponse()
  const raw = { ...response, nodes: response.nodes.map(node => ({ ...node, label: 42 })) }
  assert.throws(() => parseMindMapGeneration(JSON.stringify(raw)), /label/)
})

test('stored content and label limits are enforced before generation succeeds', () => {
  const badNotes = mapResponse()
  badNotes.nodes[0]!.notes = 'x'.repeat(2001)
  const badLabel = mapResponse()
  badLabel.nodes[0]!.label = 'x'.repeat(81)
  for (const response of [badNotes, badLabel]) {
    assert.throws(() => parseMindMapGeneration(JSON.stringify(response)))
  }
})

test('the previous 2000-character notes limit is preserved', () => {
  const response = mapResponse()
  response.nodes[1]!.notes = 'x'.repeat(401)
  assert.equal(parseMindMapGeneration(JSON.stringify(response)).status, 'map')
})

test('structurally invalid maps remain errors, not no_source', () => {
  const response = mapResponse()
  response.nodes[2]!.parentIndex = 1
  assert.throws(() => parseMindMapGeneration(JSON.stringify(response)), /3 gałęzie/)
})

test('generated trees preserve the saved-cell format and valid node references', () => {
  const result = parseMindMapGeneration(JSON.stringify(mapResponse()))
  assert.equal(result.status, 'map')
  if (result.status !== 'map') return
  const saved = { title: 'krew', topicType: result.topicType, root: collapseBelowDepth(result.root, 1) }
  assert.deepEqual(parseMindMapCellContent(JSON.stringify(saved)), saved)
  assert.equal(result.root.parentId, null)
  assert.equal(result.root.depth, 0)
  for (const child of result.root.children) {
    assert.equal(child.parentId, result.root.id)
    assert.equal(child.depth, 1)
  }
  assert.equal(new Set([result.root.id, ...result.root.children.map(c => c.id)]).size, 4)
})
