export interface OpiekunReaderSection {
  title: string
  /** Toggleable algorithm steps; absent for text-only sections. */
  steps?: string[]
  /** Free-text section body (procedure description). */
  description?: string
}

export type ReaderDirection = 1 | -1
