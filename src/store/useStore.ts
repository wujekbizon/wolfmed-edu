import { create } from 'zustand'

interface StateType {
  isMenuOpen: boolean
  isSidePanelOpen: boolean
  isDeleteModalOpen: boolean
  testIdToDelete: string | null // Track which test is being deleted
  toggleMenu: () => void
  toggleSidePanel: () => void
  openDeleteModal: (testId: string | null) => void
  closeDeleteModal: () => void
}

export const useStore = create<StateType>((set) => ({
  isSidePanelOpen: false,
  isMenuOpen: false,
  isDeleteModalOpen: false,
  testIdToDelete: null,
  toggleMenu: () => set((state: StateType) => ({ isMenuOpen: !state.isMenuOpen })),
  toggleSidePanel: () => set((state: StateType) => ({ isSidePanelOpen: !state.isSidePanelOpen })),
  openDeleteModal: (testId: string | null) => set(() => ({ isDeleteModalOpen: true, testIdToDelete: testId })),
  closeDeleteModal: () => set(() => ({ isDeleteModalOpen: false, testIdToDelete: null })),
}))
