import { create } from 'zustand'

interface DashboardState {
  isDragEnabled: boolean
  toggleDrag: () => void
  isSupporter: boolean
  isDeleteModalOpen: boolean
  noteIdToDelete: string | null
  materialIdToDelete: string | null
  postIdToDelete: string | null
  setIsSupporter: (isSupporter: boolean) => void
  openDeleteModal: (noteId: string | null) => void
  openDeleteMaterialModal: (materialId: string | null) => void
  openDeletePostModal: (postId: string | null) => void
  closeDeleteModal: () => void
}

export const useDashboardStore = create<DashboardState>((set) => ({
  isDragEnabled: false,
  toggleDrag: () => set((state) => ({ isDragEnabled: !state.isDragEnabled })),
  isSupporter: false,
  isDeleteModalOpen: false,
  noteIdToDelete: null,
  materialIdToDelete: null,
  postIdToDelete: null,
  setIsSupporter: (isSupporter: boolean) => set({ isSupporter }),
  openDeleteModal: (noteId: string | null) => set(() => ({ isDeleteModalOpen: true, noteIdToDelete: noteId })),
  openDeleteMaterialModal: (materialId: string | null) => set(() => ({ isDeleteModalOpen: true, materialIdToDelete: materialId })),
  openDeletePostModal: (postId: string | null) => set(() => ({ isDeleteModalOpen: true, postIdToDelete: postId })),
  closeDeleteModal: () => set(() => ({ isDeleteModalOpen: false, noteIdToDelete: null, materialIdToDelete: null, postIdToDelete: null })),
}))
