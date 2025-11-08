import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Lecture } from "@teaching-playground/core";

/**
 * Playground Store - UI State Only
 *
 * This store manages ONLY UI state like modals and selections.
 * For user data: use Clerk's useUser() hook
 * For server operations: use server actions from @/actions/teachingPlayground
 */
interface PlaygroundState {
  selectedLecture: Lecture | null;
  isCreateModalOpen: boolean;
  error: string | null;
  setSelectedLecture: (lecture: Lecture | null) => void;
  setCreateModalOpen: (isOpen: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const usePlaygroundStore = create<PlaygroundState>()(
  persist(
    (set) => ({
      selectedLecture: null,
      isCreateModalOpen: false,
      error: null,
      setSelectedLecture: (lecture) => set({ selectedLecture: lecture }),
      setCreateModalOpen: (isOpen) => set({ isCreateModalOpen: isOpen }),
      setError: (error) => set({ error }),
      reset: () => {
        set({
          selectedLecture: null,
          isCreateModalOpen: false,
          error: null,
        });
      },
    }),
    {
      name: "playground-storage",
      partialize: (state) => ({
        selectedLecture: state.selectedLecture,
      }),
    }
  )
);
