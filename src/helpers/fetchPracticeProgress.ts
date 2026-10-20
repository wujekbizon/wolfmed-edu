import { PracticeProgressError } from '@/lib/PracticeProgressError'
import type { PracticeView } from '@/types/learningPracticeTypes'

export async function fetchPracticeProgress(userId: string, category: string, signal?: AbortSignal): Promise<PracticeView | null> {
  const params = new URLSearchParams({ userId, category })
  const response = await fetch(`/api/learning/progress?${params}`, {
    cache: 'no-store', credentials: 'same-origin', ...(signal ? { signal } : {}),
  })
  if (!response.ok) throw new PracticeProgressError(response.status)
  return response.json()
}
