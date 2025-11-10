import { create } from 'zustand'

interface TestToDelete {
  id: string
  question: string
}

interface CategoryToDelete {
  name: string
  count: number
}

interface CustomTestsState {
  isDeleteTestModalOpen: boolean
  testToDelete: TestToDelete | null
  isDeleteCategoryModalOpen: boolean
  categoryToDelete: CategoryToDelete | null
  openDeleteTestModal: (test: TestToDelete) => void
  closeDeleteTestModal: () => void
  openDeleteCategoryModal: (category: CategoryToDelete) => void
  closeDeleteCategoryModal: () => void
}

export const useCustomTestsStore = create<CustomTestsState>((set) => ({
  isDeleteTestModalOpen: false,
  testToDelete: null,
  isDeleteCategoryModalOpen: false,
  categoryToDelete: null,
  openDeleteTestModal: (test: TestToDelete) => set({ isDeleteTestModalOpen: true, testToDelete: test }),
  closeDeleteTestModal: () => set({ isDeleteTestModalOpen: false, testToDelete: null }),
  openDeleteCategoryModal: (category: CategoryToDelete) => set({ isDeleteCategoryModalOpen: true, categoryToDelete: category }),
  closeDeleteCategoryModal: () => set({ isDeleteCategoryModalOpen: false, categoryToDelete: null }),
}))
