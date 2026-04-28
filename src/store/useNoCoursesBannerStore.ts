import { create } from 'zustand'

interface NoCoursesBannerState {
  isOpen: boolean
  show: () => void
  hide: () => void
}

export const useNoCoursesBannerStore = create<NoCoursesBannerState>((set) => ({
  isOpen: false,
  show: () => set({ isOpen: true }),
  hide: () => set({ isOpen: false }),
}))
