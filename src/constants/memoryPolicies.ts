// Default memory policies — the pedagogical/product rules that shape every
// tutor answer. Pure data (no imports) so both the app and the standalone seed
// script can consume it. answer_grounding is the product's core promise
// ("not another chatbot"): reason over sources or say it's not in the base.

export type PolicyType = 'pedagogy' | 'guardrail' | 'blueprint' | 'product'

export interface DefaultPolicy {
  policyKey: string
  policyType: PolicyType
  policyValue: Record<string, unknown>
}

export const DEFAULT_POLICIES: DefaultPolicy[] = [
  {
    policyKey: 'answer_grounding',
    policyType: 'guardrail',
    policyValue: { require_corpus_citation: true },
  },
  {
    policyKey: 'medical_disclaimer',
    policyType: 'guardrail',
    policyValue: { inject_on: ['dawkowanie', 'plan_leczenia'] },
  },
  {
    policyKey: 'answer_language',
    policyType: 'pedagogy',
    policyValue: { language: 'pl' },
  },
]
