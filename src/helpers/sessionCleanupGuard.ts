type CleanupGenerations = Map<string, number>

const globalCleanupState = globalThis as typeof globalThis & {
  __wolfmedTestSessionCleanupGenerations?: CleanupGenerations
}

function getGenerations() {
  globalCleanupState.__wolfmedTestSessionCleanupGenerations ??= new Map()
  return globalCleanupState.__wolfmedTestSessionCleanupGenerations
}

export function markSessionMounted(sessionId: string) {
  const generations = getGenerations()
  const generation = (generations.get(sessionId) ?? 0) + 1
  generations.set(sessionId, generation)
  return generation
}

export function claimSessionUnmount(sessionId: string, generation: number) {
  const generations = getGenerations()
  if (generations.get(sessionId) !== generation) return false
  generations.delete(sessionId)
  return true
}
