import test from 'node:test'
import assert from 'node:assert/strict'
import { parseMindMapGeneration } from '@/helpers/parseMindMapGeneration'
import { MINDMAP_RESPONSE_SCHEMA } from '@/constants/mindmapResponseSchema'
import { mapResponse } from './fixtures/generation'

test('cycles, forward references, extra roots and missing roots are rejected', () => {
  for (const parentIndex of [null, 1, 2, 99, -1]) {
    const response = mapResponse()
    response.nodes[1]!.parentIndex = parentIndex
    assert.throws(() => parseMindMapGeneration(JSON.stringify(response)))
  }
  const response = mapResponse()
  response.nodes[0]!.parentIndex = 0
  assert.throws(() => parseMindMapGeneration(JSON.stringify(response)))
})

test('depth overflow is normalized to the existing three-level limit', () => {
  const response = mapResponse()
  for (let depth = 1; depth <= 4; depth++) {
    response.nodes.push({ ...response.nodes[1]!, parentIndex: depth === 1 ? 0 : response.nodes.length - 1 })
  }
  const result = parseMindMapGeneration(JSON.stringify(response))
  assert.equal(result.status, 'map')
  if (result.status !== 'map') return
  let node = result.root.children.at(-1)!
  for (let depth = 1; depth <= 3; depth++) {
    assert.equal(node.depth, depth)
    if (depth < 3) {
      const child = node.children[0]!
      assert.equal(child.parentId, node.id)
      node = child
    }
  }
  assert.deepEqual(node.children, [])
})

test('child overflow uses the existing normalization limit without rejecting the map', () => {
  const response = mapResponse()
  for (let index = 0; index < 4; index++) response.nodes.push({ ...response.nodes[1]! })
  const result = parseMindMapGeneration(JSON.stringify(response))
  assert.equal(result.status, 'map')
  if (result.status !== 'map') return
  assert.equal(result.root.children.length, 6)
  assert.ok(result.root.children.every(node => node.parentId === result.root.id))
})

test('nested branches convert to the existing tree format', () => {
  const response = mapResponse()
  response.nodes.push({ ...response.nodes[1]!, label: 'Woda', parentIndex: 1 })
  const result = parseMindMapGeneration(JSON.stringify(response))
  assert.equal(result.status, 'map')
  if (result.status !== 'map') return
  const water = result.root.children[0]!.children[0]!
  assert.equal(water.label, 'Woda')
  assert.equal(water.depth, 2)
  assert.equal(water.parentId, result.root.children[0]!.id)
})

test('provider schema uses a flat list without recursive tree constraints', () => {
  const properties = MINDMAP_RESPONSE_SCHEMA.properties!
  assert.deepEqual(properties.status!.enum, ['map', 'no_source'])
  assert.equal(properties.nodes!.items!.properties!.children, undefined)
  assert.equal(properties.nodes!.items!.properties!.parentIndex!.nullable, true)
})
