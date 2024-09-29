import React from 'react'

interface AuthButtonProps {
  text: string
  onClick?: () => void
  isPlaceholder?: boolean
}

export const AuthButton: React.FC<AuthButtonProps> = ({ text, onClick, isPlaceholder = false }) => {
  const baseClasses = 'text-base py-[7px] px-4 rounded-full transition-colors'
  const activeClasses =
    'bg-white border border-red-200/40 shadow-sm hover:text-[#ffa5a5] shadow-zinc-500 text-zinc-900 hover:bg-[#ffffff]'
  const placeholderClasses = 'bg-white opacity-20 border border-[#ffa5a5] animate-pulse'

  return (
    <button
      className={`${baseClasses} ${isPlaceholder ? placeholderClasses : activeClasses}`}
      onClick={onClick}
      disabled={isPlaceholder}
    >
      {text}
    </button>
  )
}
