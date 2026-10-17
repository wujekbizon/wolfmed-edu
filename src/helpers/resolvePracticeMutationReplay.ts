import { PracticeConflictError } from '@/server/learning/PracticeConflictError'
import type { PracticeView } from '@/types/learningPracticeTypes'

export async function resolvePracticeMutationReplay(
  session: Pick<PracticeView, 'version' | 'status'>, version: number,
  existing: PracticeView | undefined, getCurrentView: () => Promise<PracticeView>,
): Promise<PracticeView | null> {
  if (existing) return existing
  if (session.version !== version || session.status !== 'active') {
    throw new PracticeConflictError(await getCurrentView())
  }
  return null
}
