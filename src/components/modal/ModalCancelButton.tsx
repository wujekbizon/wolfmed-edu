'use client'

interface ModalCancelButtonProps {
  onClick: () => void
  label?: string
}

export default function ModalCancelButton({ onClick, label = 'Anuluj' }: ModalCancelButtonProps) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2 text-sm text-zinc-400 hover:text-zinc-100 font-medium transition-colors"
    >
      {label}
    </button>
  )
}
