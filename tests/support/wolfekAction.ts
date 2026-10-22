import assert from 'node:assert/strict'
import { RagQuerySchema } from '@/server/schema'
import { toFormState, fromErrorToFormState } from '@/helpers/toFormState'
import { parseMcpCommands } from '@/helpers/parse-mcp-commands'
import { extractLeadingCount } from '@/helpers/extractLeadingCount'
import { resolveCommandCount } from '@/helpers/resolveCommandCount'
import { combineModelTokenUsage } from '@/helpers/combineModelTokenUsage'
import { TOOL_COMMANDS } from '@/constants/toolCommands'
import { extractSource, loadSource } from './loadSource'
import type { CheckRateLimit, WolfekAction } from './rateLimitTypes'

export function wolfekAction(userId: string, checkRateLimit: CheckRateLimit) {
  let generated = 0
  let retrievals = 0
  const source = extractSource(new URL('../../src/actions/rag-actions.ts', import.meta.url), 'askRagQuestion')
  const { askRagQuestion } = loadSource<{ askRagQuestion: WolfekAction }>(source, {
    auth: async () => ({ userId }), checkPremiumAccessAction: async () => true,
    checkRateLimit: async (id: string, action: string) => {
      assert.equal(id, userId)
      assert.equal(action, 'rag:query')
      return checkRateLimit(id, action)
    },
    RagQuerySchema, toFormState, fromErrorToFormState, parseMcpCommands,
    extractLeadingCount, resolveCommandCount, TOOL_COMMANDS, combineModelTokenUsage,
    startTutorTurnTrace: async () => null,
    classifyTutorIntent: async () => ({ status: 'classified' }),
    resolveTutorRoute: () => 'rag',
    buildStaticPrefix: async () => '', buildMemoryTail: async () => ({ text: '' }),
    retrieveContext: async (input: { userId: string }) => {
      assert.equal(input.userId, userId)
      retrievals++
      return { hasCanonical: true, chunks: [], sources: [] }
    },
    generateGroundedAnswer: async () => {
      generated++
      return { answer: 'Offline model stub', sources: [] }
    },
    console: { error: (...args: unknown[]) => { throw new Error(`Unexpected Wolfek error: ${String(args[1])}`) } },
  })
  return { askRagQuestion, counts: () => ({ generated, retrievals }) }
}
