"use server"

import { auth } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"
import { db } from "@/server/db/index"
import { checkRateLimit } from "@/lib/rateLimit"
import {
  saveChallengeCompletion,
  checkAllChallengesComplete,
  awardBadge,
  getChallengeCompletionsByProcedure,
  getProcedureBadge,
  getProcedureById,
} from "@/server/queries"
import { fromErrorToFormState, toFormState } from "@/helpers/toFormState"
import { SubmitOrderStepsSchema } from "@/server/schema"
import type { FormState } from "@/types/actionTypes"
import type {
  ActionResult,
  ChallengeType,
  ProcedureProgress,
} from "@/types/challengeTypes"
import type { Procedure, StepWithId } from "@/types/dataTypes"

/**
 * Get challenge progress for a specific procedure
 */
export async function getChallengeProgressAction(
  procedureId: string,
  procedureName: string
): Promise<ActionResult<ProcedureProgress>> {
  const { userId } = await auth()

  if (!userId) {
    return { success: false, error: "Unauthorized" }
  }

  try {
    // Get all completions for this procedure
    const completions = await getChallengeCompletionsByProcedure(
      userId,
      procedureId
    )

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
    }, {} as ProcedureProgress["completions"])

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
    console.error("Get challenge progress failed:", error)
    return {
      success: false,
      error: "Failed to load progress",
    }
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
  if (!userId) throw new Error("Unauthorized")

  const rateLimit = await checkRateLimit(userId, "challenge:submit")
  if (!rateLimit.success) {
    const resetMinutes = Math.ceil((rateLimit.reset - Date.now()) / 60000)
    return toFormState(
      "ERROR",
      `Zbyt wiele żądań. Spróbuj ponownie za ${resetMinutes} minut.`
    )
  }

  const procedureId = formData.get("procedureId") as string
  const procedureName = formData.get("procedureName") as string
  const stepOrderString = formData.get("stepOrder") as string
  const timeSpent = formData.get("timeSpent") as string

  const validationResult = SubmitOrderStepsSchema.safeParse({
    procedureId,
    procedureName,
    stepOrder: stepOrderString,
    timeSpent,
  })

  if (!validationResult.success) {
    return {
      ...fromErrorToFormState(validationResult.error),
      values: {
        procedureId,
        procedureName,
        stepOrder: stepOrderString,
        timeSpent,
      },
    }
  }

  try {
    const {
      procedureId,
      procedureName,
      stepOrder: stepOrderJson,
      timeSpent,
    } = validationResult.data

    // Parse step order
    const userStepOrder: StepWithId[] = JSON.parse(stepOrderJson)

    // Load procedure from DB (server-side)
    const procedure = await getProcedureById(procedureId) as Procedure
    if (!procedure) {
      return toFormState("ERROR", "Procedura nie została znaleziona")
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
        challengeType: "order-steps",
        score,
        timeSpent,
      })

      // Check if all 5 challenges are complete
      const allComplete = await checkAllChallengesComplete(
        tx,
        userId,
        procedureId
      )

      // Award badge if all challenges complete
      if (allComplete) {
        await awardBadge(tx, {
          userId,
          procedureId,
          procedureName,
        })
      }
    })

    revalidatePath(`/panel/procedury/opiekun-medyczny/${procedureId}/wyzwania`)
    revalidatePath("/panel")
    return toFormState("SUCCESS", `Ukończono! Wynik: ${score}%`)
  } catch (error) {
    return fromErrorToFormState(error)
  }
}

