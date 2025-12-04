interface ChallengeButtonProps {
  onClick: () => void
  children: React.ReactNode
  className?: string
  disabled?: boolean
}

const ChallengeButton: React.FC<ChallengeButtonProps> = ({ onClick, children, className = '', disabled = false }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`bg-[#ffc5c5] hover:bg-[#f58a8a] text-zinc-800 font-bold py-2 px-4 rounded transition-colors duration-200 shadow-md ${className} ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      {children}
    </button>
  )
}

export default ChallengeButton
