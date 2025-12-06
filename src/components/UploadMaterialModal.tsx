"use client"

import { useMaterialModalStore } from "@/store/useMaterialModalStore"
import UploadMaterialForm from "./UploadMaterialForm"
import CloseIcon from "./icons/Close"

export default function UploadMaterialModal() {
  const { uploadModal, closeUploadModal } = useMaterialModalStore()

  if (!uploadModal.isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg w-full max-w-3xl p-6 relative">
        <button onClick={closeUploadModal} className="absolute top-1 right-1">
          <CloseIcon />
        </button>
        <UploadMaterialForm onSuccess={closeUploadModal} />
      </div>
    </div>
  )
}
