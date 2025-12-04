import { create } from 'zustand'

interface ConfirmModalState {
  isOpen: boolean
  title: string
  message: string
  confirmLabel: string
  cancelLabel: string
  onConfirm: (() => void) | null
  onCancel: (() => void) | null
  openConfirmModal: (config: {
    title?: string
    message: string
    confirmLabel?: string
    cancelLabel?: string
    onConfirm: () => void
    onCancel?: () => void
  }) => void
  closeConfirmModal: () => void
}

export const useConfirmModalStore = create<ConfirmModalState>((set) => ({
  isOpen: false,
  title: 'Potwierdź',
  message: '',
  confirmLabel: 'Potwierdź',
  cancelLabel: 'Anuluj',
  onConfirm: null,
  onCancel: null,
  openConfirmModal: (config) => set({
    isOpen: true,
    title: config.title || 'Potwierdź',
    message: config.message,
    confirmLabel: config.confirmLabel || 'Potwierdź',
    cancelLabel: config.cancelLabel || 'Anuluj',
    onConfirm: config.onConfirm,
    onCancel: config.onCancel || null
  }),
  closeConfirmModal: () => set({
    isOpen: false,
    onConfirm: null,
    onCancel: null
  })
}))
