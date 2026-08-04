export interface ItemCountResult<T> {
  items: T[]
  requested: number
  shortfall: number
}

/**
 * Holds a generator to the number of items it was asked for.
 *
 * Over-generation is trimmed; under-generation is reported rather than absorbed.
 * A model asked for 10 questions that returns 7 used to hand back 7 with nothing
 * saying so, which is indistinguishable from the request never arriving.
 */
export function enforceItemCount<T>(items: T[], requested: number): ItemCountResult<T> {
  const trimmed = items.length > requested ? items.slice(0, requested) : items

  return {
    items: trimmed,
    requested,
    shortfall: Math.max(0, requested - trimmed.length),
  }
}
