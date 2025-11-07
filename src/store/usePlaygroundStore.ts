import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Lecture, User } from "@/lib/teaching-playground/interfaces";
import TeachingPlayground from "@/lib/teaching-playground/engine/TeachingPlayground";

interface PlaygroundState {
  selectedLecture: Lecture | null;
  isCreateModalOpen: boolean;
  error: string | null;
  user: User | null;
  username: string | null;
  playground: TeachingPlayground | null;
  isAuthenticated: boolean;
  setSelectedLecture: (lecture: Lecture | null) => void;
  setCreateModalOpen: (isOpen: boolean) => void;
  setError: (error: string | null) => void;
  setUser: (user: User | null) => void;
  setUsername: (username: string | null) => void;
  setPlayground: (playground: TeachingPlayground | null) => void;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  reset: () => void;
}

export const usePlaygroundStore = create<PlaygroundState>()(
  persist(
    (set) => ({
      selectedLecture: null,
      isCreateModalOpen: false,
      error: null,
      user: null,
      username: null,
      playground: null,
      isAuthenticated: false,
      setSelectedLecture: (lecture) => set({ selectedLecture: lecture }),
      setCreateModalOpen: (isOpen) => set({ isCreateModalOpen: isOpen }),
      setError: (error) => set({ error }),
      setUser: (user) => set({ user, username: user?.username || null }),
      setUsername: (username) => set({ username }),
      setPlayground: (playground) => set({ playground }),
      setIsAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
      reset: () => {
        set({
          selectedLecture: null,
          isCreateModalOpen: false,
          error: null,
          user: null,
          username: null,
          playground: null,
          isAuthenticated: false,
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
