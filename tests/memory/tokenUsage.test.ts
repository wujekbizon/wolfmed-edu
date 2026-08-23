import test from 'node:test'
import assert from 'node:assert/strict'
import { combineModelTokenUsage } from '@/helpers/combineModelTokenUsage'
import { getModelTokenUsage } from '@/helpers/getModelTokenUsage'

test('normalizes Gemini usage metadata', () => {
  assert.deepEqual(
    getModelTokenUsage({
      promptTokenCount: 120,
      candidatesTokenCount: 35,
      thoughtsTokenCount: 5,
      totalTokenCount: 160,
    }),
    {
      inputTokens: 120,
      outputTokens: 35,
      thoughtTokens: 5,
      totalTokens: 160,
    }
  )
  assert.equal(getModelTokenUsage(undefined), undefined)
  assert.equal(
    getModelTokenUsage({ promptTokenCount: 10, candidatesTokenCount: 4 })?.totalTokens,
    14
  )
})

test('combines router and answer usage into one turn total', () => {
  assert.deepEqual(
    combineModelTokenUsage(
      { inputTokens: 20, outputTokens: 5, thoughtTokens: 0, totalTokens: 25 },
      { inputTokens: 200, outputTokens: 40, thoughtTokens: 0, totalTokens: 240 }
    ),
    { inputTokens: 220, outputTokens: 45, thoughtTokens: 0, totalTokens: 265 }
  )
  assert.equal(combineModelTokenUsage(undefined), undefined)
})
