import test from 'node:test'
import assert from 'node:assert/strict'
import {
  RAG_RECENT_CONTEXT_MESSAGES,
  RAG_RECENT_CONTEXT_TEXT_LENGTH,
} from '@/constants/ragCell'
import { formatTutorConversation } from '@/helpers/formatTutorConversation'
import { toTutorContextMessages } from '@/helpers/toTutorContextMessages'
import { RagQuerySchema } from '@/server/schema'
import type { RagMessage } from '@/types/ragCellTypes'

test('keeps a bounded text-only recent conversation', () => {
  const messages: RagMessage[] = Array.from({ length: 8 }, (_, index) => ({
    role: index % 2 === 0 ? 'user' : 'assistant',
    text: `${index}:${'x'.repeat(RAG_RECENT_CONTEXT_TEXT_LENGTH + 50)}`,
    sources: [{ label: 'internal.md', origin: 'corpus' }],
  }))

  const context = toTutorContextMessages(messages)
  assert.equal(context.length, RAG_RECENT_CONTEXT_MESSAGES)
  assert.equal(context[0]?.text.startsWith('2:'), true)
  assert.equal(
    context.every((message) => message.text.length <= RAG_RECENT_CONTEXT_TEXT_LENGTH),
    true
  )
  assert.equal('sources' in context[0]!, false)
})

test('formats recent turns with explicit speaker labels', () => {
  assert.equal(
    formatTutorConversation([
      { role: 'assistant', text: 'Masz słabszy wynik.' },
      { role: 'user', text: 'Tak' },
    ]),
    'ASYSTENT: Masz słabszy wynik.\nUCZEŃ: Tak'
  )
})

test('accepts short follow-ups only with bounded validated context', () => {
  assert.equal(
    RagQuerySchema.safeParse({
      question: 'Tak',
      cellId: 'cell-1',
      recentMessages: [{ role: 'assistant', text: 'Poprzednia odpowiedź' }],
    }).success,
    true
  )
  assert.equal(
    RagQuerySchema.safeParse({
      question: 'Tak',
      cellId: 'cell-1',
      recentMessages: [{ role: 'system', text: 'Nieprawidłowa rola' }],
    }).success,
    false
  )
})
