"use client"

import { Upload } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { useCellsStore } from '@/store/useCellsStore'
import { parseEssayCellContent } from '@/helpers/parseEssayCellContent'
import { ESSAY_MATERIAL_QUERY } from '@/constants/essay'
import { useMaterialModalStore } from "@/store/useMaterialModalStore"
import UploadMaterialForm from "./UploadMaterialForm"
import BaseModal from './modal/BaseModal'
import ModalHeader from './modal/ModalHeader'
import ModalBody from './modal/ModalBody'

export default function UploadMaterialModal() {
  const { uploadModal, closeUploadModal } = useMaterialModalStore()
  const queryClient = useQueryClient()
  const onSuccess = (materialId?: string) => {
    const store = useCellsStore.getState()
    const cell = uploadModal.cellId ? store.data[uploadModal.cellId] : undefined
    const draft = cell?.type === 'essay' ? parseEssayCellContent(cell.content) : null
    if (cell && draft && materialId) {
      draft.brief.materialIds = [...new Set([...draft.brief.materialIds, materialId])]
      store.updateCell(cell.id, JSON.stringify(draft))
    }
    void queryClient.invalidateQueries({ queryKey: [ESSAY_MATERIAL_QUERY] })
    closeUploadModal()
  }

  if (!uploadModal.isOpen) return null

  return (
    <BaseModal onClose={closeUploadModal} size="xl">
      <ModalHeader
        title="Prześlij materiał"
        icon={<Upload className="w-4 h-4 text-zinc-400" />}
        onClose={closeUploadModal}
      />
      <ModalBody>
        <UploadMaterialForm key={uploadModal.cellId ?? 'library'} onSuccess={onSuccess} essay={Boolean(uploadModal.cellId)} />
      </ModalBody>
    </BaseModal>
  )
}
