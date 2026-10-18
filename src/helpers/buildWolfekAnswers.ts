import { WOLFEK_FACT_LABELS } from '@/constants/wolfekResponses'
import { getWolfekFact } from './getWolfekFact'
import { renderWolfekTemplate } from './renderWolfekTemplate'
import type { WolfekAnswer, WolfekContext, WolfekPack } from '@/types/wolfekResponseTypes'

export function buildWolfekAnswers(pack: WolfekPack, context: WolfekContext) {
  const answers: Record<string, WolfekAnswer> = {}
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
  }
  return answers
}
