import type { FactCandidate, NewMemoryEpisode } from '@/types/memoryTypes'


export interface ProfileEvent {
  userId: string
  category: string
  eventId: string
  questionId: string
  revision: string
  kind: string
  at: Date
  payload: { attempts: number; correct: boolean; assisted: boolean }
}

export interface ProfileProjectionState {
  afterHistoryRead?: () => Promise<void>
  events: ProfileEvent[]
  facts: Map<string, FactCandidate>
  episodes: Map<string, NewMemoryEpisode>
  metrics: {
    transactions: number; openTransactions: number; peakOpenTransactions: number
    poolWaits: number; peakPoolQueue: number; lockWaits: number; peakLockQueue: number
    historyReads: number; historyRows: number; profileReads: number
    factWrites: number; episodeWrites: number
  }
}
