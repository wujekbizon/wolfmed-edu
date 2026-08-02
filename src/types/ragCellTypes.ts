export interface RagMessage {
  role: 'user' | 'assistant'
  text: string
  sources?: string[] | undefined
}

// Set when the cell was spawned by „Wyjaśnij szerzej" on a mind-map node, so the
// answer can be written back onto that node.
export interface RagExplainOrigin {
  mapCellId: string
  nodeId: string
}

// Shape stored (JSON-serialized) in a "rag" cell's content. Cells created before
// this shape existed hold the bare question string — parseRagCellContent reads
// those as a topic with no history.
export interface RagCellContent {
  topic: string
  messages: RagMessage[]
  origin?: RagExplainOrigin | undefined
}
