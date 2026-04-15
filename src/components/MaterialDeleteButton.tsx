'use client'

import { useDashboardStore } from '@/store/useDashboardStore'
import { Trash2 } from 'lucide-react'

export default function MaterialDeleteButton({ materialId }: { materialId: string }) {
  const { openDeleteMaterialModal } = useDashboardStore()

  return (
    <button
      type="button"
      className="flex items-center justify-center text-zinc-600 hover:text-red-500 hover:bg-red-50 rounded-md cursor-pointer px-2 py-1 transition-colors"
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        openDeleteMaterialModal(materialId)
      }}
      aria-label="Usuń materiał"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  )
}
