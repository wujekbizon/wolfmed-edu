type PaginationButtonProps = {
  children: React.ReactNode
  onClick: () => void
  disabled: boolean
}

export default function PaginationButton({ disabled, onClick, children }: PaginationButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${
        disabled
          ? 'bg-[#2A2A3F]/30 disabled:cursor-not-allowed opacity-50 text-[#A5A5C3]'
          : 'bg-[#BB86FC]/10 hover:bg-[#BB86FC]/20 hover:text-[#E6E6F5] hover:border-[#BB86FC]/50 text-[#BB86FC]'
      } cursor-pointer min-w-[60px] xs:min-w-[80px] sm:min-w-24 text-xs xs:text-sm sm:text-base px-3 sm:px-4 py-2 transition-all duration-300 rounded-lg border border-[#3A3A5A]/50 font-medium`}
    >
      {children}
    </button>
  )
}
