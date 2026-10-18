import type { PracticeAnswerUpdates, PracticeProgressVersions, TestSessionProgress } from '@/types/testTypes'

export function mergePracticeProgress(
  progress: TestSessionProgress,
  versions: PracticeProgressVersions,
  updates: PracticeAnswerUpdates
) {
  let nextProgress = progress
  let nextVersions = versions
  for (const [id, update] of Object.entries(updates)) {
    const current = versions[id]
    if (current?.clientId === update.clientId && current.revision >= update.revision) continue
    if (current?.clientId !== update.clientId && (current?.revision ?? 0) !== update.baseRevision) {
      return null
    }
    if (nextProgress === progress) {
      nextProgress = { ...progress }
      nextVersions = { ...versions }
    }
    nextProgress[id] = update.answerIndex
    nextVersions[id] = { revision: update.revision, clientId: update.clientId }
  }
  return { progress: nextProgress, versions: nextVersions }
}
