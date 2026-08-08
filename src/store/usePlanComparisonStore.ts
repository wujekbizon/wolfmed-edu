import { create } from 'zustand'

interface PlanComparisonState {
  isOpen: boolean
  open: () => void
  close: () => void
  toggle: () => void
}

export const usePlanComparisonStore = create<PlanComparisonState>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
}))
