"use client"

import { useMaterialModalStore } from "@/store/useMaterialModalStore"

export default function TextPreviewModal() {
  const { textModal, closeTextModal } = useMaterialModalStore()

  if (!textModal.isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white p-6 rounded-md shadow-xl border border-zinc-200/60 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-zinc-800">
            Podgląd: {textModal.title ?? ""}
          </h3>
          <button onClick={closeTextModal} className="text-zinc-500 hover:text-zinc-800 text-2xl">×</button>
        </div>
        <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200/60 overflow-auto max-h-[60vh]">
          <pre className="whitespace-pre-wrap text-sm text-zinc-800">{textModal.content}</pre>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <button onClick={() => textModal.src && window.open(textModal.src, "_blank")} className="bg-red-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-red-700">
            Otwórz pełny
          </button>
        </div>
      </div>
    </div>
  )
}
