import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Lecture, User } from "@/lib/teaching-playground/interfaces";

interface PlaygroundState {
  selectedLecture: Lecture | null;
  isCreateModalOpen: boolean;
  error: string | null;
  user: User | null;
  isPlaygroundInitialized: boolean;
  setSelectedLecture: (lecture: Lecture | null) => void;
  setCreateModalOpen: (isOpen: boolean) => void;
  setError: (error: string | null) => void;
  setUser: (user: User | null) => void;
  reset: () => void;
}

export const usePlaygroundStore = create<PlaygroundState>()(
  persist(
    (set) => ({
      selectedLecture: null,
      isCreateModalOpen: false,
      error: null,
      user: null,
      isPlaygroundInitialized: false,
      setSelectedLecture: (lecture) => set({ selectedLecture: lecture }),
      setCreateModalOpen: (isOpen) => set({ isCreateModalOpen: isOpen }),
      setError: (error) => set({ error }),
      setUser: (user) => {
        set({
          user,
          isPlaygroundInitialized: !!user,
        });
      },
      reset: () => {
        set({
          selectedLecture: null,
          isCreateModalOpen: false,
          error: null,
          user: null,
          isPlaygroundInitialized: false,
        });
      },
    }),
    {
      name: "playground-storage",
      partialize: (state) => ({
        selectedLecture: state.selectedLecture,
        isCreateModalOpen: state.isCreateModalOpen,
        user: state.user,
        isPlaygroundInitialized: state.isPlaygroundInitialized,
      }),
    }
  )
);
