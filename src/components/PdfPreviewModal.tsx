"use client"

import PDFViewer from "./reader/PDFViewer"
import { useMaterialModalStore } from "@/store/useMaterialModalStore"

export default function PdfPreviewModal() {
  const { pdfModal, closePdfModal, downloadPdf, openFullPdf } = useMaterialModalStore()

  if (!pdfModal.isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white p-6 rounded-md shadow-xl border border-zinc-200/60 w-full max-w-4xl max-h-[90vh] overflow-y-auto scrollbar-webkit">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-zinc-800">
            Podgląd: {pdfModal.title ?? pdfModal.src ?? ""}
          </h3>
          <button onClick={closePdfModal} className="text-zinc-500 hover:text-zinc-800 text-2xl">×</button>
        </div>
        <div className="bg-zinc-50 min-h-[500px] flex items-center justify-center rounded-xl border border-zinc-200/60">
          <PDFViewer file={pdfModal.src} />
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <button onClick={downloadPdf} className="bg-zinc-100 text-zinc-700 px-4 py-2 rounded-full text-sm font-medium hover:bg-zinc-200">
            Pobierz
          </button>
          <button onClick={openFullPdf} className="bg-red-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-red-700">
            Otwórz pełny
          </button>
        </div>
      </div>
    </div>
  )
}
