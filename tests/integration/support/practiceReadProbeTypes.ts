export type PracticeReadMetrics = {
  transactions: number
  openTransactions: number
  queries: number
  cardReads: number
  sessionReads: number
  savedItemReads: number
  reviewScans: number
  reviewQuestionReads: number
  serializedResultBytes: number
  modelCalls: number
  retrievalCalls: number
  assistanceWrites: number
  cacheWrites: number
}

export type PracticeReadMeasurement = PracticeReadMetrics & {
  audit: 'F05'
  mode: 'hint' | 'compare'
  oldRevealedCards: number
}
