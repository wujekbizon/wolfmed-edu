import { create } from 'zustand'

export const usePracticeSelectionStore = create<{
  selections: Record<string, number>
  select: (key: string, value: number) => void
  clear: (key: string) => void
  clearCategory: (userId: string, category: string) => void
}>((set) => ({
  selections: {},
  select: (key, value) => set((state) => ({ selections: { ...state.selections, [key]: value } })),
  clear: (key) => set((state) => {
    const selections = { ...state.selections }
    delete selections[key]
    return { selections }
  }),
  clearCategory: (userId, category) => set((state) => {
    const prefix = `${userId}:${category}:`
    return { selections: Object.fromEntries(Object.entries(state.selections)
      .filter(([key]) => !key.startsWith(prefix))) }
  }),
}))
