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

// ── Material extraction ─────────────────────────────────────────────────────
// 'unindexable' and 'not_indexed' are terminal: a video has no text layer and
// never will, and a basic-plan upload is deliberately never read. 'failed' is
// retryable. The cron selects 'pending' and 'failed' by name, so a terminal
// status is excluded by construction.
export type MaterialIndexStatus = 'pending' | 'indexed' | 'unindexable' | 'failed' | 'not_indexed'

// Basic plans include the 20 MB of storage the course was sold with, but not the
// Gemini call that reads a PDF. Set at upload rather than skipped silently: left
// as 'pending' the cron would extract it within a day, and the cost would arrive
// detached from the upload that caused it.
export const UNINDEXED_STATUS: MaterialIndexStatus = 'not_indexed'

// Only these yield text. The uploader also accepts video/mp4 and
// application/json; both are marked unindexable on arrival.
export const EXTRACTABLE_MIME_TYPES = ['application/pdf'] as const

// Gemini reads the file once at upload. Flash rather than Flash-Lite: this runs
// a single time per material and has to cope with scanned pages, where the
// cheaper model loses text a student would expect to find.
export const EXTRACTION_MODEL = 'gemini-2.5-flash'

// A 4 MB PDF (the uploader's ceiling) of dense text lands well inside this.
export const EXTRACTION_MAX_OUTPUT_TOKENS = 32_000

// Shorter than this and the file yielded nothing usable — an image-only page
// the model could not read, or an empty document. Marked failed, not indexed,
// so it is visible rather than silently searchable-as-nothing.
export const MIN_EXTRACTED_CHARS = 40

// How many stalled materials one backstop run picks up. Bounded so a run cannot
// exceed the function timeout.
export const EXTRACTION_SWEEP_BATCH = 5

// ── Embedding ───────────────────────────────────────────────────────────────
// Chunks are written with a null embedding and filled afterwards. How many one
// pass handles.
//
// Bounded by wall clock, not appetite: calls are paced at EMBED_PACE_MS to stay
// under Vertex's per-minute request quota, so this many chunks takes at least
// batch × pace, before any retry. Whatever a pass does not reach stays pending
// and the next one picks it up, so a small batch costs nothing but time.
export const EMBED_SWEEP_BATCH = 15

// ── Retrieval ───────────────────────────────────────────────────────────────
// Lexical is weighted above vector, as in the memory layer: trigram similarity
// catches the inflected forms and near-spellings of Polish medical vocabulary
// that a 768-dimension truncated embedding blurs.
export const LIB_FUSION_WEIGHTS = { vector: 0.4, lexical: 0.6 } as const

// TUNE. Source-specific, because the sources are not equally trustworthy. An
// uploaded skrypt is a finished document someone else wrote and edited; a note
// is whatever the student typed, possibly mid-thought. The note has to clear a
// higher bar to occupy a slot the curriculum could have used.
export const LIB_SCORE_FLOOR = { material: 0.4, note: 0.55 } as const

// Noise cut for word_similarity, not a selector — ranking picks the chunk, this
// only has to sit below the weakest real positive. Measured on pg_trgm 1.6
// against real chunks: genuine hits scored 0.337-1.0 and irrelevant chunks
// reached 0.48, so the ranges overlap and no value separates them cleanly.
export const LIB_TRGM_FLOOR = 0.3

// How many library candidates to gather before fusing with the corpus. Wider
// than the final slot count so rank fusion has something to choose between.
export const LIB_TOP_K = 12

// TUNE. Reciprocal rank fusion constant. The conventional 60 is calibrated for
// lists of hundreds; against a dozen it flattens every rank into the same score.
export const RRF_K = 10

// TUNE. A ceiling, never a target. Personal chunks fill these slots only when
// they clear their floor — a thin corpus yields fewer chunks rather than a
// context padded out with notes.
export const LIB_SLOT_SHARE = 1 / 3

// The curriculum's guaranteed allocation, taken before fusion runs. Without it,
// rank fusion alone lets a personal chunk sitting at rank 0 of a short list
// outscore curriculum at rank 4 of a long one, so the ceiling above fills every
// single time and stops being a ceiling.
export const CANONICAL_RESERVED_SLOTS = 8

// Below this best score the library did not answer the question. Measured over
// four questions: hits peaked at 0.635, 0.674 and 0.930, while a sociology PDF
// against a blood-pressure question produced eleven chunks in a 0.485-0.558
// band — the same flat cluster a missed corpus makes. LIB_SCORE_FLOOR alone let
// that band through and cited sociology under a physiology answer.
//
// Expect to revisit this sooner than the corpus gate: a larger library means
// more chances for something irrelevant to reach 0.6 by accident.
export const PERSONAL_MISS_SCORE = 0.6

// Kill switch for implicit personal retrieval. Flipping this turns
// canonical_with_personal into canonical_only everywhere. It deliberately does
// NOT touch explicit_resource: the student named that source, and honouring an
// @attachment is not the behaviour anyone would want to switch off in a hurry.
export const ENABLE_IMPLICIT_PERSONAL_RETRIEVAL = true
