'use server'

import { auth } from '@clerk/nextjs/server'
import { PANEL_WOLFEK_ONBOARDING_PREFIX } from '@/constants/panelWolfek'
import { getRedis } from '@/lib/redis'
import { getUserEnrolledCourses } from '@/server/queries'
import { getPanelOnboardingSeen } from '@/server/companion/getPanelOnboardingSeen'

export async function getPanelOnboardingSeenAction() {
  const { userId } = await auth()
  if (!userId || !(await getUserEnrolledCourses(userId)).length) return true
  return getPanelOnboardingSeen(userId)
}

export async function markPanelOnboardingSeenAction() {
  const { userId } = await auth()
  if (!userId || !(await getUserEnrolledCourses(userId)).length) return false
  const redis = getRedis()
  if (!redis) return false
  try {
    await redis.set(`${PANEL_WOLFEK_ONBOARDING_PREFIX}${userId}`, '1', { ex: 365 * 24 * 60 * 60 })
    return true
  } catch { return false }
}
