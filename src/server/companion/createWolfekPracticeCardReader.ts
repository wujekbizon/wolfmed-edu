import 'server-only'
import { loadWolfekPracticeCard } from './loadWolfekPracticeCard'
import type { WolfekPracticeCardReader, WolfekPracticeCardSnapshot } from '@/types/wolfekPracticeServerTypes'

export function createWolfekPracticeCardReader(userId: string): WolfekPracticeCardReader {
  let key: string | undefined
  let snapshot: Promise<WolfekPracticeCardSnapshot> | undefined
  return ref => {
    const nextKey = JSON.stringify([ref.category, ref.sessionId, ref.version, ref.questionId, ref.revision, ref.selected])
    if (!snapshot || key !== nextKey) {
      key = nextKey
      snapshot = loadWolfekPracticeCard(userId, ref)
    }
    return snapshot
  }
}
