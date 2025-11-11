import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface CustomCategory {
  id: string
  name: string
  questionIds: string[]
}

interface QuestionSelection {
  customCategories: CustomCategory[]
  isDeleteModalOpen: boolean
  categoryToDelete: string | null
  createCategory: (name: string) => void
  editCategory: (id: string, newName: string) => void
  deleteCategory: (id: string) => void
  addQuestionToCategory: (categoryId: string, questionId: string) => void
  removeQuestionFromCategory: (categoryId: string, questionId: string) => void
  clearAll: () => void
  openDeleteModal: (categoryId: string) => void
  closeDeleteModal: () => void
}

export const useQuestionSelectionStore = create<QuestionSelection>()(
  persist(
    (set) => ({
      customCategories: [],
      isDeleteModalOpen: false,
      categoryToDelete: null,
      createCategory: (name) =>
        set((state) => ({
          customCategories: [...state.customCategories, { id: crypto.randomUUID(), name, questionIds: [] }],
        })),
      editCategory: (id, newName) =>
        set((state) => ({
          customCategories: state.customCategories.map((cat) => (cat.id === id ? { ...cat, name: newName } : cat)),
        })),
      deleteCategory: (id) =>
        set((state) => ({
          customCategories: state.customCategories.filter((cat) => cat.id !== id),
        })),
      addQuestionToCategory: (categoryId, questionId) =>
        set((state) => ({
          customCategories: state.customCategories.map((cat) =>
            cat.id === categoryId ? { ...cat, questionIds: [...cat.questionIds, questionId] } : cat
          ),
        })),
      removeQuestionFromCategory: (categoryId, questionId) =>
        set((state) => ({
          customCategories: state.customCategories.map((cat) =>
            cat.id === categoryId ? { ...cat, questionIds: cat.questionIds.filter((id) => id !== questionId) } : cat
          ),
        })),
      clearAll: () =>
        set(() => ({
          customCategories: [],
        })),
      openDeleteModal: (categoryId) =>
        set(() => ({
          isDeleteModalOpen: true,
          categoryToDelete: categoryId,
        })),
      closeDeleteModal: () =>
        set(() => ({
          isDeleteModalOpen: false,
          categoryToDelete: null,
        })),
    }),
    {
      name: 'question-categories-storage',
    }
  )
)
