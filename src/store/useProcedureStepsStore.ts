import { create } from 'zustand'

interface ProcedureStepsState {
  // marked step numbers keyed by procedure
  marked: Record<string, number[]>
  toggleStep: (procedureId: string, stepNumber: number) => void
  clearProcedure: (procedureId: string) => void
}

export const useProcedureStepsStore = create<ProcedureStepsState>((set) => ({
  marked: {},
  toggleStep: (procedureId, stepNumber) =>
    set((state) => {
      const current = state.marked[procedureId] ?? []
      const next = current.includes(stepNumber)
        ? current.filter((n) => n !== stepNumber)
        : [...current, stepNumber]
      return { marked: { ...state.marked, [procedureId]: next } }
    }),
  clearProcedure: (procedureId) =>
    set((state) => {
      if (!state.marked[procedureId]) return state
      const next = { ...state.marked }
      delete next[procedureId]
      return { marked: next }
    }),
}))
