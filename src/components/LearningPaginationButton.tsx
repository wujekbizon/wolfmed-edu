interface Props {
  children: React.ReactNode
  onClick: () => void
  disabled: boolean
}

export default function LearningPaginationButton({ children, onClick, disabled }: Props) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium
        shadow-md transition-all min-w-[80px] sm:min-w-24
        ${
          disabled
            ? 'bg-zinc-200 text-zinc-400 cursor-not-allowed opacity-50'
            : 'bg-[#ffb1b1] hover:bg-[#f58a8a] text-zinc-800 hover:text-white hover:shadow-lg active:scale-95'
        }`}
    >
      {children}
    </button>
  )
}
