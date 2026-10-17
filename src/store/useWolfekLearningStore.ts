import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { WolfekLearningStore } from '@/types/wolfekLearningTypes'
import type { WolfekQuestionState } from '@/types/wolfekResponseTypes'
import { WOLFEK_LEARNING_CACHE_VERSION } from '@/constants/wolfekLearning'

export const useWolfekLearningStore = create<WolfekLearningStore>()(persist((set) => ({
  entries: {}, latestByCard: {}, hydrated: false, setHydrated: () => set({ hydrated: true }),
  selectReply: (key, mode) => set((state) => {
    const entry = state.entries[key]
    const reply = entry?.replies[mode]
    return reply ? { entries: { ...state.entries, [key]: { ...entry, current: reply, latest: mode } } } : state
  }),
  saveReply: (key, mode, state) => set((current) => {
    if (!state.answer || state.status !== 'SUCCESS' || !state.values?.learningGrounded) return current
    const previous = current.entries[key]
    if (previous?.current.timestamp === state.timestamp) return current
    const reply: WolfekQuestionState = { ...state, values: {
      learningGenerated: true, learningGrounded: true, learningMode: mode,
      userQuestion: String(state.values.userQuestion ?? ''), restored: true,
    } }
    delete reply.session
    const replies = state.values.origin === 'prepared' ? { ...previous?.replies, [mode]: reply } : previous?.replies ?? {}
    const entry = { replies, current: reply, latest: mode, updatedAt: Date.now(),
      messages: [...previous?.messages ?? [],
        { role: 'user' as const, text: String(state.values.userQuestion ?? '').slice(0, 2000) },
        { role: 'assistant' as const, text: state.answer.text.slice(0, 2000) }].slice(-4) }
    const entries = Object.fromEntries(Object.entries({ ...current.entries, [key]: entry })
      .sort(([, a], [, b]) => b.updatedAt - a.updatedAt).slice(0, 100))
    const scope = JSON.stringify(JSON.parse(key).slice(0, 4))
    const latestByCard = Object.fromEntries(Object.entries({ ...current.latestByCard, [scope]: key })
      .filter(([, entryKey]) => Boolean(entries[entryKey])))
    return { entries, latestByCard }
  }),
}), {
  name: WOLFEK_LEARNING_CACHE_VERSION,
  storage: createJSONStorage(() => localStorage),
  skipHydration: true,
  partialize: (state) => ({ entries: state.entries, latestByCard: state.latestByCard }),
  onRehydrateStorage: () => (state) => state?.setHydrated(),
}))
