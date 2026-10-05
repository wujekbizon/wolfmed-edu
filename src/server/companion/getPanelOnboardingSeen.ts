import 'server-only'
import { PANEL_WOLFEK_ONBOARDING_PREFIX } from '@/constants/panelWolfek'
import { getRedis } from '@/lib/redis'

export async function getPanelOnboardingSeen(userId: string) {
  try {
    return await getRedis()?.exists(`${PANEL_WOLFEK_ONBOARDING_PREFIX}${userId}`) === 1
  } catch {
    return false
  }
}
