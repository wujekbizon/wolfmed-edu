import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { Procedure, StepWithId } from '@/types/dataTypes'

interface ProceduresState {
  procedures: Procedure[]
  steps: StepWithId[]
  currentProcedure: Procedure | null
  score: number
  setProcedures: (procedures: Procedure[]) => void
  setCurrentProcedure: (procedure: Procedure | null) => void
  setScore: (score: number) => void
  setSteps: (steps: StepWithId[] | ((steps: StepWithId[]) => StepWithId[])) => void
}

export const useProceduresStore = create<ProceduresState>()(
  persist(
    (set) => ({
      procedures: [],
      steps: [],
      currentProcedure: null,
      score: 0,
      setProcedures: (procedures) => set({ procedures }),
      setCurrentProcedure: (procedure) => set({ currentProcedure: procedure }),
      setScore: (score) => set({ score }),
      setSteps: (steps) => {
        if (typeof steps === 'function') {
          set((state) => ({ steps: steps(state.steps) }))
        } else {
          set({ steps })
        }
      },
    }),
    {
      name: 'procedures-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
