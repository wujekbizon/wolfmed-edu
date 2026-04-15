"use client"

import { FileText } from 'lucide-react'
import PDFViewer from "./reader/PDFViewer"
import { useMaterialModalStore } from "@/store/useMaterialModalStore"
import BaseModal from './modal/BaseModal'
import ModalHeader from './modal/ModalHeader'
import ModalBody from './modal/ModalBody'
import ModalFooter from './modal/ModalFooter'

export default function PdfPreviewModal() {
  const { pdfModal, closePdfModal, downloadPdf, openFullPdf } = useMaterialModalStore()

  if (!pdfModal.isOpen) return null

  return (
    <BaseModal onClose={closePdfModal} size="xl" fullScreenMobile>
      <ModalHeader
        title={`Podgląd: ${pdfModal.title ?? pdfModal.src ?? ""}`}
        icon={<FileText className="w-4 h-4 text-zinc-400" />}
        onClose={closePdfModal}
      />
      <ModalBody className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-webkit">
        <PDFViewer file={pdfModal.src} />
      </ModalBody>
      <ModalFooter>
        <button
          onClick={downloadPdf}
          className="bg-white/10 text-zinc-200 hover:bg-white/20 px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer"
        >
          Pobierz
        </button>
        <button
          onClick={openFullPdf}
          className="bg-zinc-700 text-zinc-100 hover:bg-zinc-600 px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer"
        >
          Otwórz pełny
        </button>
      </ModalFooter>
    </BaseModal>
  )
}
