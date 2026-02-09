export type CellTypes = "note" | "rag" | "draw"

export interface Cell {
  id: string
  type: CellTypes
  content: string
}

export interface UserCellsList {
  id: string
  userId?: string
  order: string[]
  cells: Record<string, Cell>
  updatedAt?: Date
  createdAt?: Date
}
