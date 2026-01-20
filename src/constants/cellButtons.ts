import { CellTypes } from "@/types/cellTypes"


interface CellButtons {
    id: number
    cellName: string
    type: CellTypes
  }

export const cellButtons: CellButtons[] = [
    {
      id: 1,
      cellName: 'Notatka',
      type: 'note',
    },
    {
      id: 2,
      cellName: 'AI Asystent',
      type: 'rag',
    },
    {
      id: 3,
      cellName: 'Tablica',
      type: 'draw',
    },
  ]