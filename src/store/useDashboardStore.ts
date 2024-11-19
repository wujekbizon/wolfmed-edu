import { create } from 'zustand'

interface DashboardState {
  isDragEnabled: boolean
  toggleDrag: () => void
  isSupporter: boolean
  setIsSupporter: (isSupporter: boolean) => void
}

export const useDashboardStore = create<DashboardState>((set) => ({
  isDragEnabled: false,
  toggleDrag: () => set((state) => ({ isDragEnabled: !state.isDragEnabled })),
  isSupporter: false,
  setIsSupporter: (isSupporter: boolean) => set({ isSupporter }),
}))
