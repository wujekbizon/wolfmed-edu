import { create } from 'zustand'

interface InstagramBannerState {
  isDismissed: boolean
  dismiss: () => void
  reset: () => void
}

export const useInstagramBannerStore = create<InstagramBannerState>((set) => ({
  isDismissed: false,
  dismiss: () => set({ isDismissed: true }),
  reset: () => set({ isDismissed: false }),
}))
