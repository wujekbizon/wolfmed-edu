// The whole cells list travels as a single JSON blob, so a cell's history is
// capped rather than allowed to grow with every exchange.
export const RAG_MAX_MESSAGES = 20
export const RAG_RECENT_CONTEXT_MESSAGES = 6
export const RAG_RECENT_CONTEXT_TEXT_LENGTH = 1500
export const RAG_RECENT_CONTEXT_SERIALIZED_LENGTH = 10_000
