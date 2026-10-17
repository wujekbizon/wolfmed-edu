import { JEV_MODEL } from '@/constants/jev'
import { WOLFEK_FACT_LABELS } from '@/constants/wolfekResponses'
import { getWolfekFact } from './getWolfekFact'
import { renderWolfekTemplate } from './renderWolfekTemplate'
import { getWolfekDecisionFacts } from './getWolfekDecisionFacts'
import { buildWolfekJudgments } from './buildWolfekJudgments'
import { WOLFEK_RESPONSE_RULES } from '@/constants/wolfekJudgments'
import type { WolfekBuiltRequest, WolfekContext, WolfekPack, WolfekQuestionRequest } from '@/types/wolfekResponseTypes'

export function buildWolfekResponseRequest(
  input: WolfekQuestionRequest, pack: WolfekPack, context: WolfekContext,
): WolfekBuiltRequest {
  const answers: WolfekBuiltRequest['answers'] = {}
  const criteria: Record<string, unknown> = {}
  for (const option of pack.options) {
    const checks = option.conditions.map((condition) => ({
      actual: getWolfekFact(context.facts, condition.path), expected: condition.equals,
    }))
    if (checks.some(({ actual, expected }) => actual !== undefined && actual !== null && actual !== expected)) continue
    if (option.conditions.some((condition) => getWolfekFact(context.facts, condition.path) === null &&
      condition.equals !== null && pack.options.some((candidate) => candidate.conditions.some((fallback) =>
        fallback.path === condition.path && fallback.equals === null)))) continue
    const missing = option.requiredFacts.filter((path) => getWolfekFact(context.facts, path) == null)
    const text = missing.length ? null : renderWolfekTemplate(option.template, context.facts)
    const unknown = checks.some(({ actual, expected }) => actual === undefined || (actual === null && expected !== null))
    const unavailable = text === null || unknown
    const id = unavailable ? `unavailable_${option.id}` : option.id
    const label = WOLFEK_FACT_LABELS[(missing[0] ?? option.conditions[0]?.path ?? '').split('.')[0]!] ?? 'te informacje'
    const destination = option.action ? context.destinations[option.action.destinationKey] : null
    const action = unavailable || !option.action || !destination ? null : {
      ...destination, type: option.action.type === 'confirm_recommended_action' ? destination.type : option.action.type,
    }
    if (option.action && !action && !unavailable) continue
    answers[id] = { responseId: id, topic: option.topic,
      text: unavailable ? `Nie mogę teraz sprawdzić: ${label}. Spróbuj ponownie później.` : text!, action }
    criteria[id] = null
  }
  return { answers, payload: { model: JEV_MODEL, state: {
    route: input.route, question: input.question, facts: getWolfekDecisionFacts(context.facts), rules: WOLFEK_RESPONSE_RULES,
    responseOptions: Object.fromEntries(Object.entries(answers).map(([id, answer]) => [id, {
      text: answer.text, covers: pack.options.find((option) => option.id === id || `unavailable_${option.id}` === id)?.covers,
      availability: id.startsWith('unavailable_') ? 'missing_data' : 'verified',
    }])),
    submission: { id: input.submissionId, origin: input.origin },
    ...(input.origin === 'typed' && input.recentMessages?.length ? { conversation: input.recentMessages } : {}),
  }, questions: buildWolfekJudgments('state.question', criteria as Record<string, null>) } }
}
