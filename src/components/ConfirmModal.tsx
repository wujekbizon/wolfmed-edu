'use client'

import { useConfirmModalStore } from '@/store/useConfirmModalStore'

export default function ConfirmModal() {
  const { isOpen, title, message, confirmLabel, cancelLabel, onConfirm, onCancel, closeConfirmModal } = useConfirmModalStore()

  if (!isOpen) return null

  const handleConfirm = () => {
    onConfirm?.()
    closeConfirmModal()
  }

  const handleCancel = () => {
    onCancel?.()
    closeConfirmModal()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-zinc-200 p-6 max-w-md w-full">
        <h3 className="text-lg font-semibold text-zinc-900 mb-3">{title}</h3>
        <p className="text-zinc-600 mb-6">{message}</p>
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-sm text-zinc-600 hover:text-zinc-800 font-medium transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 bg-gradient-to-r from-[#ff9898] to-[#ffc5c5] text-white rounded-lg text-sm font-medium hover:shadow-md transition-all"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
