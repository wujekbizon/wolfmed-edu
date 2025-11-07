'use server'

import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { db } from '@/server/db/index'
import {
  saveChallengeCompletion,
  checkAllChallengesComplete,
  awardBadge,
  getChallengeCompletionsByProcedure,
  getProcedureBadge,
} from '@/server/queries'
import { fileData } from '@/server/fetchData'
import { fromErrorToFormState, toFormState } from '@/helpers/toFormState'
import {
  SubmitOrderStepsSchema,
  SubmitQuizSchema,
  SubmitVisualRecognitionSchema,
  SubmitScenarioSchema,
  SubmitSpotErrorSchema,
} from '@/server/schema'
import {
  generateQuizChallenge,
  generateVisualRecognitionChallenge,
  generateScenarioChallenge,
  generateSpotErrorChallenge,
} from '@/helpers/challengeGenerator'
import type { FormState } from '@/types/actionTypes'
import type { ActionResult, ChallengeType, ProcedureProgress } from '@/types/challengeTypes'
import type { StepWithId } from '@/types/dataTypes'

/**
 * Get challenge progress for a specific procedure
 */
export async function getChallengeProgressAction(
  procedureId: string,
  procedureName: string
): Promise<ActionResult<ProcedureProgress>> {
  const { userId } = await auth()

  if (!userId) {
    return { success: false, error: 'Unauthorized' }
  }

  try {
    // Get all completions for this procedure
    const completions = await getChallengeCompletionsByProcedure(userId, procedureId)

    // Get badge if earned
    const badge = await getProcedureBadge(userId, procedureId)

    // Convert completions array to object keyed by challenge type
    const completionsMap = completions.reduce((acc, completion) => {
      acc[completion.challengeType as ChallengeType] = {
        completed: true,
        completedAt: completion.completedAt.toISOString(),
        score: completion.score,
        timeSpent: completion.timeSpent,
        attempts: completion.attempts,
      }
      return acc
    }, {} as ProcedureProgress['completions'])

    return {
      success: true,
      data: {
        procedureId,
        procedureName,
        completions: completionsMap,
        totalCompleted: completions.length,
        badgeEarned: !!badge,
      },
    }
  } catch (error) {
    console.error('Get challenge progress failed:', error)
    return {
      success: false,
      error: 'Failed to load progress',
    }
  }
}

/**
 * Submit quiz challenge with server-side score calculation
 */
export async function submitQuizAction(
  formState: FormState,
  formData: FormData
) {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  const procedureId = formData.get('procedureId') as string
  const procedureName = formData.get('procedureName') as string
  const answers = formData.get('answers') as string
  const correctAnswers = formData.get('correctAnswers') as string
  const timeSpent = formData.get('timeSpent') as string

  const validationResult = SubmitQuizSchema.safeParse({
    procedureId,
    procedureName,
    answers,
    correctAnswers,
    timeSpent,
  })

  if (!validationResult.success) {
    return {
      ...fromErrorToFormState(validationResult.error),
      values: { procedureId, procedureName, answers, correctAnswers, timeSpent },
    }
  }

  try {
    const { procedureId, procedureName, answers: answersJson, correctAnswers: correctAnswersJson, timeSpent } = validationResult.data

    // Parse user answers and correct answers from client
    const userAnswers: Record<string, number> = JSON.parse(answersJson)
    const correctAnswersMap: Record<string, number> = JSON.parse(correctAnswersJson)

    // Calculate score by comparing against correct answers sent from client
    let correctCount = 0
    const totalQuestions = Object.keys(correctAnswersMap).length

    Object.keys(correctAnswersMap).forEach((questionId) => {
      if (userAnswers[questionId] === correctAnswersMap[questionId]) {
        correctCount++
      }
    })
    const score = Math.round((correctCount / totalQuestions) * 100)

    // Save challenge completion
    await db.transaction(async (tx) => {
      await saveChallengeCompletion(tx, {
        userId,
        procedureId,
        challengeType: 'knowledge-quiz',
        score,
        timeSpent,
      })

      // Check if all 5 challenges are complete
      const allComplete = await checkAllChallengesComplete(tx, userId, procedureId)

      // Award badge if all challenges complete
      if (allComplete) {
        await awardBadge(tx, {
          userId,
          procedureId,
          procedureName,
        })
      }
    })

    revalidatePath(`/panel/procedury/${procedureId}/wyzwania`)
    revalidatePath('/panel')

    return toFormState('SUCCESS', `Ukończono! Wynik: ${score}%`)
  } catch (error) {
    return fromErrorToFormState(error)
  }
}

/**
 * Submit order steps challenge with server-side score calculation
 */
export async function submitOrderStepsAction(
  formState: FormState,
  formData: FormData
) {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  const procedureId = formData.get('procedureId') as string
  const procedureName = formData.get('procedureName') as string
  const stepOrderString = formData.get('stepOrder') as string
  const timeSpent = formData.get('timeSpent') as string

  const validationResult = SubmitOrderStepsSchema.safeParse({
    procedureId,
    procedureName,
    stepOrder: stepOrderString,
    timeSpent,
  })

  if (!validationResult.success) {
    return {
      ...fromErrorToFormState(validationResult.error),
      values: { procedureId, procedureName, stepOrder: stepOrderString, timeSpent },
    }
  }

  try {
    const { procedureId, procedureName, stepOrder: stepOrderJson, timeSpent } = validationResult.data

    // Parse step order
    const userStepOrder: StepWithId[] = JSON.parse(stepOrderJson)

    // Load procedure from DB (server-side)
    const procedure = await fileData.getProcedureById(procedureId)
    if (!procedure) {
      return toFormState('ERROR', 'Procedura nie została znaleziona')
    }

    const correctSteps = procedure.data.algorithm
    let correctCount = 0
    for (let i = 0; i < correctSteps.length; i++) {
      const correctStep = correctSteps[i]
      const userStep = userStepOrder[i]
      if (correctStep && userStep && correctStep.step === userStep.step) {
        correctCount++
      }
    }
    const score = Math.round((correctCount / correctSteps.length) * 100)

    // Save challenge completion
    await db.transaction(async (tx) => {
      await saveChallengeCompletion(tx, {
        userId,
        procedureId,
        challengeType: 'order-steps',
        score,
        timeSpent,
      })

      // Check if all 5 challenges are complete
      const allComplete = await checkAllChallengesComplete(tx, userId, procedureId)

      // Award badge if all challenges complete
      if (allComplete) {
        await awardBadge(tx, {
          userId,
          procedureId,
          procedureName,
        })
      }
    })

    revalidatePath(`/panel/procedury/${procedureId}/wyzwania`)
    revalidatePath('/panel')
    return toFormState('SUCCESS', `Ukończono! Wynik: ${score}%`)
  } catch (error) {
    return fromErrorToFormState(error)
  }

}


/**
 * Submit visual recognition challenge with server-side score calculation
 */
export async function submitVisualRecognitionAction(
  formState: FormState,
  formData: FormData
) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  const procedureId = formData.get("procedureId") as string
  const procedureName = formData.get("procedureName") as string
  const selectedOption = formData.get("selectedOption") as string
  const correctAnswer = formData.get("correctAnswer") as string
  const timeSpent = formData.get("timeSpent") as string

  const validationResult = SubmitVisualRecognitionSchema.safeParse({
    procedureId,
    procedureName,
    selectedOption,
    correctAnswer,
    timeSpent,
  })

  if (!validationResult.success) {
    return {
      ...fromErrorToFormState(validationResult.error),
      values: { procedureId, procedureName, selectedOption, correctAnswer, timeSpent },
    }
  }

  try {
    const { procedureId, procedureName, selectedOption, correctAnswer, timeSpent } = validationResult.data

    const procedure = await fileData.getProcedureById(procedureId)
    if (!procedure) {
      return toFormState("ERROR", "Procedura nie została znaleziona")
    }

    // Compare selectedOption against the correctAnswer sent from client
    const isCorrect = selectedOption === correctAnswer
    const score = isCorrect ? 100 : 0

    await db.transaction(async (tx) => {
      await saveChallengeCompletion(tx, {
        userId,
        procedureId,
        challengeType: "visual-recognition",
        score,
        timeSpent,
      })

      const allComplete = await checkAllChallengesComplete(tx, userId, procedureId)

      if (allComplete) {
        await awardBadge(tx, {
          userId,
          procedureId,
          procedureName,
        })
      }
    })

    revalidatePath(`/panel/procedury/${procedureId}/wyzwania`)
    revalidatePath("/panel")
    return toFormState('SUCCESS', `Ukończono! Wynik: ${score}%`)
  } catch (error) {
    return fromErrorToFormState(error)
  }
}

/**
 * Submit scenario challenge with server-side score calculation
 */
export async function submitScenarioAction(
  formState: FormState,
  formData: FormData
) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  const procedureId = formData.get("procedureId") as string
  const procedureName = formData.get("procedureName") as string
  const selectedOption = formData.get("selectedOption") as string
  const correctAnswer = formData.get("correctAnswer") as string
  const timeSpent = formData.get("timeSpent") as string

  const validationResult = SubmitScenarioSchema.safeParse({
    procedureId,
    procedureName,
    selectedOption,
    correctAnswer,
    timeSpent,
  })

  if (!validationResult.success) {
    return {
      ...fromErrorToFormState(validationResult.error),
      values: { procedureId, procedureName, selectedOption, correctAnswer, timeSpent },
    }
  }

  try {
    const { procedureId, procedureName, selectedOption, correctAnswer, timeSpent } = validationResult.data

    const procedure = await fileData.getProcedureById(procedureId)
    if (!procedure) {
      return toFormState("ERROR", "Procedura nie została znaleziona")
    }

    const isCorrect = selectedOption === correctAnswer
    const score = isCorrect ? 100 : 0

    await db.transaction(async (tx) => {
      await saveChallengeCompletion(tx, {
        userId,
        procedureId,
        challengeType: "scenario-based",
        score,
        timeSpent,
      })

      const allComplete = await checkAllChallengesComplete(tx, userId, procedureId)

      if (allComplete) {
        await awardBadge(tx, {
          userId,
          procedureId,
          procedureName,
        })
      }
    })

    revalidatePath(`/panel/procedury/${procedureId}/wyzwania`)
    revalidatePath("/panel")
    return toFormState('SUCCESS', `Ukończono! Wynik: ${score}%`)
  } catch (error) {
    return fromErrorToFormState(error)
  }
}

/**
 * Submit spot error challenge with server-side score calculation
 */
export async function submitSpotErrorAction(
  formState: FormState,
  formData: FormData
) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  const procedureId = formData.get("procedureId") as string
  const procedureName = formData.get("procedureName") as string
  const selectedErrorsString = formData.get("selectedErrors") as string
  const actualErrorsString = formData.get("actualErrors") as string
  const timeSpent = formData.get("timeSpent") as string

  const validationResult = SubmitSpotErrorSchema.safeParse({
    procedureId,
    procedureName,
    selectedErrors: selectedErrorsString,
    actualErrors: actualErrorsString,
    timeSpent,
  })

  if (!validationResult.success) {
    return {
      ...fromErrorToFormState(validationResult.error),
      values: { procedureId, procedureName, selectedErrors: selectedErrorsString, actualErrors: actualErrorsString, timeSpent },
    }
  }

  try {
    const { procedureId, procedureName, selectedErrors: selectedErrorsJson, actualErrors: actualErrorsJson, timeSpent } = validationResult.data

    const userSelectedErrors: string[] = JSON.parse(selectedErrorsJson)
    const actualErrors: string[] = JSON.parse(actualErrorsJson)

    const correctIdentifications = userSelectedErrors.filter((id) =>
      actualErrors.includes(id)
    ).length
    const incorrectIdentifications = userSelectedErrors.filter(
      (id) => !actualErrors.includes(id)
    ).length

    const score = Math.max(
      0,
      Math.round(((correctIdentifications - incorrectIdentifications) / actualErrors.length) * 100)
    )

    await db.transaction(async (tx) => {
      await saveChallengeCompletion(tx, {
        userId,
        procedureId,
        challengeType: "spot-error",
        score,
        timeSpent,
      })

      const allComplete = await checkAllChallengesComplete(tx, userId, procedureId)

      if (allComplete) {
        await awardBadge(tx, {
          userId,
          procedureId,
          procedureName,
        })
      }
    })

    revalidatePath(`/panel/procedury/${procedureId}/wyzwania`)
    revalidatePath("/panel")
    return toFormState('SUCCESS', `Ukończono! Wynik: ${score}%`)
  } catch (error) {
    return fromErrorToFormState(error)
  }
}

