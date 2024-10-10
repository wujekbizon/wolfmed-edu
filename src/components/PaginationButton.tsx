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
          ? 'bg-white cursor-not-allowed shadow-sm'
          : 'bg-[#ffc5c5] hover:scale-95  hover:bg-[#f58a8a] hover:text-white hover:border-zinc-900 hover:shadow-sm'
      } cursor-pointer min-w-24 stroke-neutral-400 stroke-[0.75] text-base px-1 sm:px-3 py-1 text-zinc-900 transition-all rounded-md border border-red-200/60 shadow shadow-zinc-500  hover:stroke-neutral-100 `}
    >
      {children}
    </button>
  )
}
