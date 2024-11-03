import React from 'react'

interface AuthButtonProps {
  children: React.ReactNode
  onClick?: () => void
  isPlaceholder?: boolean
}

export const AuthButton: React.FC<AuthButtonProps> = ({ children, onClick, isPlaceholder = false }) => {
  const baseClasses =
    'text-xs xs:text-sm sm:text-base py-1 sm:py-[7px] bg-zinc-50  px-1 xs:px-2 sm:px-4 border-red-200/40 shadow-sm shadow-zinc-500 rounded-full flex items-center justify-center transition-colors w-[40px] h-[40px] z-10'
  const activeClasses =
    'bg-white border border-red-200/40 shadow-sm hover:text-[#ffa5a5] shadow-zinc-500 text-zinc-900 hover:bg-[#ffffff]'
  const placeholderClasses = 'bg-white opacity-20 border border-[#ffa5a5] animate-pulse'

  return (
    <div className="w-[130px] flex justify-end">
      <button
        className={`${baseClasses} ${isPlaceholder ? placeholderClasses : activeClasses}`}
        onClick={onClick}
        disabled={isPlaceholder}
      >
        {children}
      </button>
    </div>
  )
}
