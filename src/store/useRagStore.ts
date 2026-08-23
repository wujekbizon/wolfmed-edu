import { create } from 'zustand'

interface RagState {
  pendingTopic: string | null
  setPendingTopic: (topic: string | null) => void
  consumePendingTopic: () => string | null
  pendingAutoSubmitCellId: string | null
  setPendingAutoSubmitCellId: (id: string | null) => void
  consumePendingAutoSubmit: (cellId: string) => boolean
}

export const useRagStore = create<RagState>((set, get) => ({
  pendingTopic: null,
  setPendingTopic: (topic) => set({ pendingTopic: topic }),
  consumePendingTopic: () => {
    const topic = get().pendingTopic
    if (!topic) return null
    set({ pendingTopic: null })
    return topic
  },
  pendingAutoSubmitCellId: null,
  setPendingAutoSubmitCellId: (id) => set({ pendingAutoSubmitCellId: id }),
  consumePendingAutoSubmit: (cellId) => {
    if (get().pendingAutoSubmitCellId !== cellId) return false
    set({ pendingAutoSubmitCellId: null })
    return true
  },
}))
