import { create } from 'zustand'

interface GenerateTestState {
  numberTests: number | null
  isTest: boolean
  setNumberTests: (number: number | null) => void
  setIsTest: (value: boolean) => void
}

export const useGenerateTestStore = create<GenerateTestState>()((set) => ({
  numberTests: null,
  isTest: false,
  setNumberTests: (number) => set({ numberTests: number }),
  setIsTest: (value) => set({ isTest: value }),
}))
