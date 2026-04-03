import { create } from 'zustand'

interface RagState {
  pendingTopic: string | null
  setPendingTopic: (topic: string | null) => void
  pendingAutoSubmitCellId: string | null
  setPendingAutoSubmitCellId: (id: string | null) => void
}

export const useRagStore = create<RagState>((set) => ({
  pendingTopic: null,
  setPendingTopic: (topic) => set({ pendingTopic: topic }),
  pendingAutoSubmitCellId: null,
  setPendingAutoSubmitCellId: (id) => set({ pendingAutoSubmitCellId: id }),
}))
