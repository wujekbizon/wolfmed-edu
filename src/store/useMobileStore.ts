import { create } from 'zustand'

interface MobileState {
  isMobile: boolean
  setIsMobile: (isMobile: boolean) => void
}

export const useMobileStore = create<MobileState>((set) => ({
  isMobile: false,
  setIsMobile: (isMobile) => set({ isMobile }),
}))
