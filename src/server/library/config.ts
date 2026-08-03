// ── Personal library knobs ──────────────────────────────────────────────────
// Every tunable for chunking and retrieving a student's own notes and materials
// lives here, so quality is tuned by editing one file and re-measuring rather
// than by hunting literals through queries. Pure constants — no 'server-only',
// no DB — so the Drizzle schema can import it.
//
// Values marked TUNE are first guesses. None has been measured against real
// Polish medical text yet.

// TUNE. Large enough to carry a whole idea, small enough that a hit points at a
// passage rather than a page.
export const CHUNK_SIZE = 1000

// TUNE. Overlap so a sentence split across a boundary is still findable whole
// from at least one side.
export const CHUNK_OVERLAP = 150

// A chunk shorter than this is a heading or a stray line, not a passage worth
// its own embedding.
export const MIN_CHUNK_CHARS = 80

// TUNE. Ceiling per note or material, so one 4 MB PDF cannot become thousands
// of rows. At CHUNK_SIZE this covers roughly 400 000 characters.
export const MAX_CHUNKS_PER_SOURCE = 400

// Table name. createTable() prefixes 'wolfmed_', so this resolves to
// wolfmed_lib_chunks.
export const LIB_TABLE = 'lib_chunks'

export type LibrarySourceType = 'note' | 'material'
