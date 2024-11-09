import { create } from 'zustand'

interface DashboardState {
  isDragEnabled: boolean
  toggleDrag: () => void
}

export const useDashboardStore = create<DashboardState>((set) => ({
  isDragEnabled: false,
  toggleDrag: () => set((state) => ({ isDragEnabled: !state.isDragEnabled })),
}))
