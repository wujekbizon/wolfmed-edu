// Retrieval knobs live here so every flow that reads the corpus — tutor, mind
// map, AI tests, /commands, lectures, the admin probe — searches it the same way.
export const RAG_TOP_K = 12

// Map generation summarises a whole topic rather than answering one question, so
// it casts a wider net.
export const RAG_TOP_K_BROAD = 20

// Vertex keeps contexts whose vector distance is BELOW this. 0.3 only admits
// near-verbatim matches and drops terms that appear once in a source table.
export const RAG_VECTOR_DISTANCE_THRESHOLD = 0.5

// Above this distance the corpus did not answer the question at all. Measured on
// two questions: one the curriculum covers scored 0.193-0.301, one it does not
// (a sociology term) scored 0.382-0.406 — twelve chunks in a 0.024-wide band,
// which is what a corpus with nothing to say looks like. Judged on the BEST chunk
// only, so a marginal question keeps a whole context instead of a filtered one.
export const CORPUS_MISS_DISTANCE = 0.34
