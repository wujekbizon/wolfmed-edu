'use client'

import { useQuestionSelectionStore } from '@/store/useQuestionSelectionStore'
import CategoryDeleteModal from './CategoryDeleteModal'

export default function CategoryDeleteModalWrapper() {
  const { isDeleteModalOpen, categoryToDelete } = useQuestionSelectionStore()

  if (!isDeleteModalOpen) return null

  return <CategoryDeleteModal categoryId={categoryToDelete ?? undefined} />
}
