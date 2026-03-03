import { create } from 'zustand'
import type { DraftQuestion } from '@/components/cells/TestQuestionEditor'

type CellState = {
  questions: DraftQuestion[]
  editingId: string | null
  saved: boolean
  addingMore: boolean
}

type TestCellStore = {
  cells: Record<string, CellState>
  initCell: (id: string, questions: DraftQuestion[]) => void
  setEditingId: (id: string, editingId: string | null) => void
  setSaved: (id: string) => void
  setAddingMore: (id: string, v: boolean) => void
  removeQuestion: (id: string, questionId: string) => void
  updateQuestion: (id: string, updated: DraftQuestion) => void
  addQuestion: (id: string, q: DraftQuestion) => void
}

const DEFAULT_CELL: CellState = { questions: [], editingId: null, saved: false, addingMore: false }
const cell = (s: TestCellStore, id: string): CellState => s.cells[id] ?? DEFAULT_CELL

export const useTestCellStore = create<TestCellStore>()((set) => ({
  cells: {},

  initCell: (id, questions) =>
    set((s) =>
      s.cells[id]
        ? s
        : { cells: { ...s.cells, [id]: { ...DEFAULT_CELL, questions } } }
    ),

  setEditingId: (id, editingId) =>
    set((s) => ({ cells: { ...s.cells, [id]: { ...cell(s, id), editingId } } })),

  setSaved: (id) =>
    set((s) => ({ cells: { ...s.cells, [id]: { ...cell(s, id), saved: true } } })),

  setAddingMore: (id, addingMore) =>
    set((s) => ({ cells: { ...s.cells, [id]: { ...cell(s, id), addingMore } } })),

  removeQuestion: (id, questionId) =>
    set((s) => ({
      cells: {
        ...s.cells,
        [id]: { ...cell(s, id), questions: cell(s, id).questions.filter((q) => q.id !== questionId) },
      },
    })),

  updateQuestion: (id, updated) =>
    set((s) => ({
      cells: {
        ...s.cells,
        [id]: {
          ...cell(s, id),
          editingId: null,
          questions: cell(s, id).questions.map((q) => (q.id === updated.id ? updated : q)),
        },
      },
    })),

  addQuestion: (id, q) =>
    set((s) => ({
      cells: {
        ...s.cells,
        [id]: { ...cell(s, id), addingMore: false, questions: [...cell(s, id).questions, q] },
      },
    })),
}))
