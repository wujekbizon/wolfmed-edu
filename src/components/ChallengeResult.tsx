import React from 'react'

interface ChallengeResultProps {
  score: number
  isVisible: boolean
  onClose: () => void
}

const ChallengeResult: React.FC<ChallengeResultProps> = ({ score, isVisible, onClose }) => {
  if (!isVisible) return null

  return (
    <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg z-50 border border-red-200">
      <button onClick={onClose} className="absolute top-2 right-2 text-gray-500 hover:text-gray-700">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>
      <h2 className="text-lg font-bold mb-2">Wynik wyzwania</h2>
      <p className="text-2xl font-bold text-red-500">{score}%</p>
    </div>
  )
}

export default ChallengeResult
