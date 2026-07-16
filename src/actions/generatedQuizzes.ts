'use server'

import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'
import { db } from '@/server/db/index'
import { checkRateLimit } from '@/lib/rateLimit'
import {
  checkCourseAccessAction,
  checkPremiumAccessAction,
} from '@/actions/course-actions'
import {
  GeneratedKnowledgeQuizSchema,
  GeneratedScenarioQuizSchema,
  GeneratedSpotErrorQuizSchema,
  GenerateProcedureQuizSchema,
  SubmitGeneratedQuizSchema,
} from '@/server/schema'
import {
  awardBadge,
  checkAllChallengesComplete,
  getGeneratedQuizById,
  getProcedureById,
  saveChallengeCompletion,
  saveGeneratedQuiz,
} from '@/server/queries'
import { executeToolLocally } from '@/server/tools/executor'
import { retrieveContexts } from '@/server/vertex-rag'
import { toProcedureQuizInput } from '@/helpers/toProcedureQuizInput'
import { withQuizItemIds } from '@/helpers/withQuizItemIds'
import { gradeGeneratedQuiz } from '@/helpers/gradeGeneratedQuiz'
import { fromErrorToFormState, toFormState } from '@/helpers/toFormState'
import type { FormState } from '@/types/actionTypes'
import type { GeneratedQuizData } from '@/types/generatedQuizTypes'
import type { Procedure } from '@/types/dataTypes'

const QUIZ_SCHEMAS = {
  'knowledge-quiz': GeneratedKnowledgeQuizSchema,
  'spot-error': GeneratedSpotErrorQuizSchema,
  'scenario-based': GeneratedScenarioQuizSchema,
} as const

function rateLimitMessage(reset: number): string {
  const resetMinutes = Math.ceil((reset - Date.now()) / 60000)
  return `Zbyt wiele żądań. Spróbuj ponownie za ${resetMinutes} minut.`
}

async function bestEffortRagContext(procedureName: string): Promise<string> {
  try {
    const contexts = await retrieveContexts(
      `Procedura: ${procedureName}. Wskazania, przeciwwskazania, zasady bezpieczeństwa, higiena, typowe błędy i powikłania.`,
      { topK: 6 }
    )
    return contexts
      .map((context) => context.text)
      .join('\n---\n')
      .slice(0, 8000)
  } catch {
    // The RAG corpus is optional grounding — generation proceeds without it.
    return ''
  }
}

export async function generateProcedureQuizAction(
  formState: FormState,
  formData: FormData
): Promise<FormState> {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  const access = await checkCourseAccessAction('opiekun-medyczny')
  if (!access.hasAccess) {
    return toFormState('ERROR', 'Brak dostępu do kursu opiekun medyczny.')
  }

  const isPremium = await checkPremiumAccessAction()
  if (!isPremium) {
    return toFormState('ERROR', 'Funkcja dostępna tylko dla użytkowników premium.')
  }

  const rateLimit = await checkRateLimit(userId, 'quiz:generate')
  if (!rateLimit.success) {
    return toFormState('ERROR', rateLimitMessage(rateLimit.reset))
  }

  let parsed
  try {
    parsed = GenerateProcedureQuizSchema.parse({
      procedureId: formData.get('procedureId'),
      challengeType: formData.get('challengeType'),
    })
  } catch (error) {
    return fromErrorToFormState(error)
  }

  try {
    const procedure = await getProcedureById(parsed.procedureId)
    if (!procedure) {
      return toFormState('ERROR', 'Procedura nie została znaleziona.')
    }

    const input = toProcedureQuizInput(procedure as Procedure)
    const context = await bestEffortRagContext(input.procedureName)

    const generated = await executeToolLocally('quiz_proceduralny_tool', {
      procedureName: input.procedureName,
      steps: input.steps,
      challengeType: parsed.challengeType,
      context,
    })

    let raw: unknown
    try {
      raw = JSON.parse(generated.content)
    } catch {
      return toFormState('ERROR', 'Nie udało się wygenerować quizu. Spróbuj ponownie.')
    }

    const validation = QUIZ_SCHEMAS[parsed.challengeType].safeParse(raw)
    if (!validation.success) {
      return toFormState('ERROR', 'Wygenerowany quiz był nieprawidłowy. Spróbuj ponownie.')
    }

    const quizJson: GeneratedQuizData = withQuizItemIds(
      parsed.challengeType,
      validation.data as Record<string, unknown>
    )

    const quizId = await saveGeneratedQuiz({
      userId,
      procedureId: parsed.procedureId,
      challengeType: parsed.challengeType,
      quizJson,
    })

    return {
      ...toFormState('SUCCESS', 'Nowy quiz został wygenerowany!'),
      values: { quizId, challengeType: parsed.challengeType },
    }
  } catch (error) {
    return fromErrorToFormState(error)
  }
}

export async function submitGeneratedQuizAction(
  formState: FormState,
  formData: FormData
): Promise<FormState> {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  const rateLimit = await checkRateLimit(userId, 'challenge:submit')
  if (!rateLimit.success) {
    return toFormState('ERROR', rateLimitMessage(rateLimit.reset))
  }

  let parsed
  try {
    parsed = SubmitGeneratedQuizSchema.parse({
      quizId: formData.get('quizId'),
      answers: formData.get('answers'),
      timeSpent: formData.get('timeSpent'),
    })
  } catch (error) {
    return fromErrorToFormState(error)
  }

  try {
    const quiz = await getGeneratedQuizById(parsed.quizId, userId)
    if (!quiz) {
      return toFormState('ERROR', 'Nie znaleziono quizu.')
    }

    const { score } = gradeGeneratedQuiz(
      quiz.challengeType,
      quiz.quizJson,
      parsed.answers
    )

    const procedureName =
      (quiz.quizJson as { procedureName?: string }).procedureName ?? ''

    await db.transaction(async (tx) => {
      await saveChallengeCompletion(tx, {
        userId,
        procedureId: quiz.procedureId,
        challengeType: quiz.challengeType,
        score,
        timeSpent: parsed.timeSpent,
      })

      const allComplete = await checkAllChallengesComplete(
        tx,
        userId,
        quiz.procedureId
      )

      if (allComplete && procedureName) {
        await awardBadge(tx, {
          userId,
          procedureId: quiz.procedureId,
          procedureName,
        })
      }
    })

    revalidatePath(`/panel/procedury/opiekun-medyczny/${quiz.procedureId}/wyzwania`)
    revalidatePath('/panel')

    return {
      ...toFormState('SUCCESS', `Ukończono! Wynik: ${score}%`),
      values: { score, passed: score >= 70 },
    }
  } catch (error) {
    return fromErrorToFormState(error)
  }
}
