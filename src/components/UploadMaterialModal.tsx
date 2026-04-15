"use client"

import { Upload } from 'lucide-react'
import { useMaterialModalStore } from "@/store/useMaterialModalStore"
import UploadMaterialForm from "./UploadMaterialForm"
import BaseModal from './modal/BaseModal'
import ModalHeader from './modal/ModalHeader'
import ModalBody from './modal/ModalBody'

export default function UploadMaterialModal() {
  const { uploadModal, closeUploadModal } = useMaterialModalStore()

  if (!uploadModal.isOpen) return null

  return (
    <BaseModal onClose={closeUploadModal} size="xl">
      <ModalHeader
        title="Prześlij materiał"
        icon={<Upload className="w-4 h-4 text-zinc-400" />}
        onClose={closeUploadModal}
      />
      <ModalBody>
        <UploadMaterialForm onSuccess={closeUploadModal} />
      </ModalBody>
    </BaseModal>
  )
}
