import React from 'react'
import ChallengeButton from './ChallengeButton'

interface Challenge {
  id: string
  name: string
  description: string
  icon: React.JSX.Element
}

interface ChallengeMenuProps {
  challenges: Challenge[]
  onStartChallenge: (challengeId: string) => void
}

const ChallengeMenu: React.FC<ChallengeMenuProps> = ({ challenges, onStartChallenge }) => {
  return (
    <div className="flex flex-col h-full w-full xl:w-2/3 lg:w-3/4">
      {challenges.map((challenge) => (
        <div
          key={challenge.id}
          className="bg-white p-6 rounded-xl shadow-md border border-zinc-400/80 min-h-[400px] w-full md:w-[340px] flex flex-col justify-around"
        >
          <h2 className="text-lg font-semibold text-center sm:text-left">{challenge.name}</h2>
          <div className="flex items-center justify-center place-self-center border border-zinc-300 p-1 rounded-2xl">
            {challenge.icon}
          </div>
          <p className="text-gray-600 text-center sm:text-left">{challenge.description}</p>
          <ChallengeButton onClick={() => onStartChallenge(challenge.id)}>Rozpocznij</ChallengeButton>
        </div>
      ))}
    </div>
  )
}

export default ChallengeMenu
