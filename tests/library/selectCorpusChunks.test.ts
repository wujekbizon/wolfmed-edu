import test from 'node:test'
import assert from 'node:assert/strict'
import { selectCorpusChunks } from '@/helpers/selectCorpusChunks'
import type { ContextChunk } from '@/types/retrievalTypes'

const blood: ContextChunk[] = [
  { text: 'Krwinki', label: '03_krew_part2.md', origin: 'corpus', score: 0.3895625786417153 },
  { text: 'Krew jest płynną tkanką.', label: '03_krew_part1.md', origin: 'corpus', score: 0.4136697921842842 },
]

test('mind-map candidates retain measured blood hits rejected by the old cutoff', () => {
  assert.deepEqual(selectCorpusChunks(blood, 'model'), blood)
})

test('existing consumers keep the default distance gate', () => {
  assert.deepEqual(selectCorpusChunks(blood), [])
  const strong = [{ ...blood[0]!, score: 0.242 }]
  assert.deepEqual(selectCorpusChunks(strong), strong)
})

test('candidate selection does not invent sources when retrieval returns nothing', () => {
  assert.deepEqual(selectCorpusChunks([], 'model'), [])
  assert.deepEqual(selectCorpusChunks([]), [])
})

test('missing scores preserve existing behavior', () => {
  const chunks = [{ text: 'Krew', label: 'blood', origin: 'corpus' as const }]
  assert.deepEqual(selectCorpusChunks(chunks), chunks)
})
