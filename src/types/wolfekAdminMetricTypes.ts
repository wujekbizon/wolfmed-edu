export type WolfekAdminSummary = {
  preparedBatches: number
  reusedButtons: number
  typedQuestions: number
  questions: number
  clicks: number
  cacheHits: number
  reviews: number
  providerCalls: number
  errors: number
  inputTokens: number
  outputTokens: number
  missingUsage: number
  avgLatency: number
}

export type WolfekAdminDaily = {
  day: string
  questions: number
  clicks: number
  cacheHits: number
  providerCalls: number
  errors: number
  inputTokens: number
  outputTokens: number
}

export type WolfekAdminTopic = {
  source: string
  topic: string
  questions: number
  clicks: number
}

export type WolfekAdminModel = {
  model: string
  calls: number
  inputTokens: number
  outputTokens: number
  missingUsage: number
}

export type WolfekAdminRoute = {
  route: string
  questions: number
  clicks: number
  providerCalls: number
}

export type WolfekAdminLifetime = {
  calls: number
  inputTokens: number
  outputTokens: number
  missingUsage: number
  providerSince: string | null
  activitySince: string | null
}
