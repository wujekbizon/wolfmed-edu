'use client'

import { useProceduresStore } from '@/store/useProceduresStore'
import { useChallengeStore } from '@/store/useChallengeStore'
import { generateChallenge } from '@/utils/challengeUtils'
import ChallengeMenu from '@/components/ChallengeMenu'
import Challenge from '@/components/Challenge'
import { challenges } from '@/constants/challenges'

export default function RandomProcedureChallenge() {
  const { procedures, setCurrentProcedure, currentProcedure, setSteps } = useProceduresStore()
  const { activeChallenge, setActiveChallenge, setIsLocked } = useChallengeStore()

  function startNewChallenge(challengeId: string) {
    if (!procedures) return

    // Set active challenge ID
    setActiveChallenge(challengeId)

    // Generate new procedure and initialize related state
    const { procedure, shuffledSteps } = generateChallenge(procedures)
    setCurrentProcedure(procedure)
    setSteps(shuffledSteps)
    setIsLocked(false)
  }

  return (
    <section className="flex w-full flex-col justify-center items-center p-2 sm:p-4 md:p-6">
      {!activeChallenge && (
        <>
          <div className="bg-zinc-800 p-4 sm:p-8 mb-6 xs:mb-6 sm:mb-12 rounded-2xl w-full xl:w-2/3 lg:w-3/4">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2 sm:mb-4 text-center">
              Wyzwania Procedury
            </h1>
            <p className="text-sm sm:text-base md:text-xl text-white max-w-xs sm:max-w-lg md:max-w-2xl mx-auto text-center">
              Zweryfikuj swoją znajomość procedur obowiązujących opiekuna medycznego. Wylosuj losowo jedną z nich i
              sprawdź, czy pamiętasz, jak należy ją prawidłowo wykonać.
            </p>
          </div>
          <ChallengeMenu challenges={challenges} onStartChallenge={startNewChallenge} />
        </>
      )}
      {activeChallenge && currentProcedure && <Challenge />}
    </section>
  )
}
