'use server'

import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'
import { db } from '@/server/db'
import {
  saveChallengeCompletion,
  checkAllChallengesComplete,
  awardBadge,
  getChallengeCompletionsByProcedure,
  getProcedureBadge,
  getUserBadges,
} from '@/server/queries'
import type { ActionResult, ChallengeType, ProcedureProgress } from '@/types/challengeTypes'

/**
 * Complete a challenge and check if badge should be awarded
 */
export async function completeChallengeAction(
  procedureId: string,
  procedureName: string,
  challengeType: ChallengeType,
  score: number,
  timeSpent: number
): Promise<ActionResult<{ badgeEarned: boolean }>> {
  const { userId } = await auth()

  if (!userId) {
    return { success: false, error: 'Unauthorized' }
  }

  try {
    let badgeEarned = false

    await db.transaction(async (tx) => {
      // 1. Save challenge completion
      await saveChallengeCompletion(tx, {
        userId,
        procedureId,
        challengeType,
        score,
        timeSpent,
      })

      // 2. Check if all 5 challenges are complete
      const allComplete = await checkAllChallengesComplete(tx, userId, procedureId)

      // 3. Award badge if all challenges complete
      if (allComplete) {
        await awardBadge(tx, {
          userId,
          procedureId,
          procedureName,
        })
        badgeEarned = true
      }
    })

    // Revalidate the challenges page
    revalidatePath(`/panel/procedury/${procedureId}/wyzwania`)
    revalidatePath('/panel') // For badge widget

    return {
      success: true,
      data: { badgeEarned },
    }
  } catch (error) {
    console.error('Challenge completion failed:', error)
    return {
      success: false,
      error: 'Failed to save challenge progress',
    }
  }
}

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
 * Get all badges earned by the user
 */
export async function getUserBadgesAction(): Promise<
  ActionResult<
    Array<{
      id: string
      procedureId: string
      procedureName: string
      badgeImageUrl: string
      earnedAt: string
    }>
  >
> {
  const { userId } = await auth()

  if (!userId) {
    return { success: false, error: 'Unauthorized' }
  }

  try {
    const badges = await getUserBadges(userId)

    return {
      success: true,
      data: badges,
    }
  } catch (error) {
    console.error('Get user badges failed:', error)
    return {
      success: false,
      error: 'Failed to load badges',
    }
  }
}
