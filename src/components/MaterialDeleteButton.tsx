'use client'

import { useDashboardStore } from '@/store/useDashboardStore'
import DeleteIcon from './icons/DeleteIcon'

export default function MaterialDeleteButton({ materialId }: { materialId: string }) {
  const { openDeleteMaterialModal } = useDashboardStore()

  return (
    <button
      type="button"
      className="flex items-center justify-center bg-red-500/40 hover:bg-red-500/70 cursor-pointer px-2 py-1 rounded transition-colors"
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        openDeleteMaterialModal(materialId)
      }}
      aria-label="Usuń materiał"
    >
      <DeleteIcon />
    </button>
  )
}
