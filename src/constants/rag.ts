// Retrieval knobs live here so every flow that reads the corpus — tutor, mind
// map, AI tests, /commands, lectures, the admin probe — searches it the same way.
export const RAG_TOP_K = 12

// Map generation summarises a whole topic rather than answering one question, so
// it casts a wider net.
export const RAG_TOP_K_BROAD = 20

// Vertex keeps contexts whose vector distance is BELOW this. 0.3 only admits
// near-verbatim matches and drops terms that appear once in a source table.
export const RAG_VECTOR_DISTANCE_THRESHOLD = 0.5
