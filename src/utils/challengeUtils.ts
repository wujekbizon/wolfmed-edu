import { shuffleArray } from '@/helpers/shuffleArray'
import { Procedure, Step, StepWithId } from '@/types/dataTypes'

export function generateChallenge(procedures: Procedure[]): { procedure: Procedure; shuffledSteps: StepWithId[] } {
  const randomProcedure = procedures[Math.floor(Math.random() * procedures.length)]

  const stepsWithIds = randomProcedure?.data.algorithm.map((step, index) => ({
    ...step,
    id: `${index}-${step.step}`,
  }))

  const shuffledSteps = shuffleArray(stepsWithIds || [])

  return {
    procedure: randomProcedure as Procedure,
    shuffledSteps,
  }
}

export function calculateScore(correctOrder: Step[], userOrder: StepWithId[]): number {
  let correctCount = 0

  for (let i = 0; i < correctOrder.length; i++) {
    if (correctOrder[i]?.step === userOrder[i]?.step) {
      correctCount++
    }
  }

  return Math.round((correctCount / correctOrder.length) * 100)
}
