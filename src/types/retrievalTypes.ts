export type ChunkOrigin = 'corpus' | 'note' | 'material'

export interface ContextChunk {
  text: string
  // Where it came from, carried all the way to prompt assembly so an answer
  // built on a student's own note reads differently from one built on the
  // curriculum.
  origin: ChunkOrigin
  // Document or note title, for citation.
  label: string
  // Retrieval score as the tier reported it. Corpus and library scores come from
  // different models and are NOT comparable to each other — this exists so each
  // tier can be judged against its own distribution, not to rank across them.
  score?: number | undefined
}

/**
 * What a feature is allowed to read.
 *
 * A closed set rather than independent booleans: `corpus: false, personal: false`
 * is not a state anything wants, and an attachment is a different *intent* from
 * a search, not a filter applied to one.
 */
export type RetrievalMode =
  // Curriculum alone. What mind maps, AI tests and plain commands do today.
  | 'canonical_only'
  // Curriculum, plus the student's own notes and materials when they earn a slot.
  | 'canonical_with_personal'
  // The student named a specific note or material. It is the primary source and
  // the corpus is not consulted.
  | 'explicit_resource'

export interface RetrieveContextOptions {
  userId: string
  // The subject alone. Memory, attachments and formatting instructions dilute
  // the query embedding — that is how a term present in the corpus comes back
  // as "no information".
  query: string
  mode: RetrievalMode
  // Required by 'explicit_resource', ignored otherwise.
  attachmentSourceIds?: string[]
  limit?: number
}

// A cited source, carrying where it came from. The origin has to survive as far
// as the UI: labelling chunks for the model but showing the student an
// undifferentiated list means an answer resting on their own half-written note
// looks exactly like one resting on the curriculum, which was the whole
// justification for indexing notes at all.
export type SourceRef = {
  label: string
  origin: ChunkOrigin
}

export interface RetrievedContext {
  chunks: ContextChunk[]
  // Distinct sources, for the sources panel.
  sources: SourceRef[]
  // False when the curriculum was searched and returned nothing. The caller has
  // to know: answering a curriculum question from a student's own notes alone,
  // in the curriculum's voice, is the failure the source rule exists to prevent.
  hasCanonical: boolean
}
