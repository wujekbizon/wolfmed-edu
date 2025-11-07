import { create } from "zustand";

interface TestFormState {
  answersNumber: number;
  selectionMethod: string;
  setSelectionMethod: (method: string) => void;
  setAnswersNumber: (number: number) => void;
}

export const useTestFormStore = create<TestFormState>()((set) => ({
  answersNumber: 3,
  selectionMethod: "existingCategory",
  setSelectionMethod: (method) => set({ selectionMethod: method }),
  setAnswersNumber: (number) => set({ answersNumber: number }),
}));