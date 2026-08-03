export type ChunkOrigin = 'corpus' | 'note' | 'material'

export interface ContextChunk {
  text: string
  // Where it came from, carried all the way to prompt assembly so an answer
  // built on a student's own note reads differently from one built on the
  // curriculum.
  origin: ChunkOrigin
  // Document or note title, for citation.
  label: string
}

export interface RetrieveContextOptions {
  userId: string
  // The subject alone. Memory, attachments and formatting instructions dilute
  // the query embedding — that is how a term present in the corpus comes back
  // as "no information".
  query: string
  corpus?: boolean
  personal?: boolean
  // Restricts the personal side to specific notes or materials. An explicit
  // attachment is a different intent from searching everything.
  attachmentSourceIds?: string[]
  limit?: number
}

export interface RetrievedContext {
  chunks: ContextChunk[]
  // Distinct source labels, for the sources panel.
  sources: string[]
}
