import { create } from 'zustand'

interface ChallengeStore {
  activeChallenge: string | null
  isLocked: boolean
  setActiveChallenge: (challengeId: string | null) => void
  setIsLocked: (isLocked: boolean) => void
}

export const useChallengeStore = create<ChallengeStore>((set) => ({
  activeChallenge: null,
  setActiveChallenge: (id) => set({ activeChallenge: id }),
  isLocked: false,
  setIsLocked: (isLocked) => set({ isLocked }),
}))
