import { create } from 'zustand'

interface DashboardState {
  isDragEnabled: boolean
  toggleDrag: () => void
  isSupporter: boolean
  isDeleteModalOpen: boolean
  noteIdToDelete: string | null
  setIsSupporter: (isSupporter: boolean) => void
  openDeleteModal: (noteId: string | null) => void
  closeDeleteModal: () => void
}

export const useDashboardStore = create<DashboardState>((set) => ({
  isDragEnabled: false,
  toggleDrag: () => set((state) => ({ isDragEnabled: !state.isDragEnabled })),
  isSupporter: false,
  isDeleteModalOpen: false,
  noteIdToDelete: null,
  setIsSupporter: (isSupporter: boolean) => set({ isSupporter }),
  openDeleteModal: (noteId: string | null) => set(() => ({ isDeleteModalOpen: true, noteIdToDelete: noteId })),
  closeDeleteModal: () => set(() => ({ isDeleteModalOpen: false, testIdToDelete: null })),
}))
