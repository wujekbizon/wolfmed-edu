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

export const useTestCellStore = create<TestCellStore>()((set) => ({
  cells: {},

  initCell: (id, questions) =>
    set((s) =>
      s.cells[id]
        ? s
        : { cells: { ...s.cells, [id]: { questions, editingId: null, saved: false, addingMore: false } } }
    ),

  setEditingId: (id, editingId) =>
    set((s) => ({ cells: { ...s.cells, [id]: { ...s.cells[id], editingId } as CellState } })),

  setSaved: (id) =>
    set((s) => ({ cells: { ...s.cells, [id]: { ...s.cells[id], saved: true } as CellState } })),

  setAddingMore: (id, addingMore) =>
    set((s) => ({ cells: { ...s.cells, [id]: { ...s.cells[id], addingMore } as CellState } })),

  removeQuestion: (id, questionId) =>
    set((s) => ({
      cells: {
        ...s.cells,
        [id]: { ...s.cells[id], questions: s.cells[id].questions.filter((q) => q.id !== questionId) } as CellState,
      },
    })),

  updateQuestion: (id, updated) =>
    set((s) => ({
      cells: {
        ...s.cells,
        [id]: {
          ...s.cells[id],
          editingId: null,
          questions: s.cells[id].questions.map((q) => (q.id === updated.id ? updated : q)),
        } as CellState,
      },
    })),

  addQuestion: (id, q) =>
    set((s) => ({
      cells: {
        ...s.cells,
        [id]: {
          ...s.cells[id],
          addingMore: false,
          questions: [...s.cells[id].questions, q],
        } as CellState,
      },
    })),
}))
