import 'server-only'
import { formatBytes } from '@/helpers/formatBytes'
import { getUserBadges, getUserStorageUsage } from '@/server/queries'
import { getWolfekPlanFacts } from './getWolfekPlanFacts'
import { getWolfekBillingFacts } from './getWolfekBillingFacts'

export async function getWolfekHomeFacts(userId: string, opiekun: boolean) {
  const [plan, billing, storage, badges] = await Promise.allSettled([
    getWolfekPlanFacts(userId, opiekun), getWolfekBillingFacts(userId),
    getUserStorageUsage(userId), getUserBadges(userId),
  ])
  const usage = storage.status === 'fulfilled' ? storage.value : null
  const earned = badges.status === 'fulfilled' ? badges.value : null
  return {
    ...(plan.status === 'fulfilled' ? plan.value : { plan: {}, exam: {} }),
    billing: billing.status === 'fulfilled' ? billing.value : {},
    storage: usage ? { usedText: formatBytes(usage.storageUsed), limitText: formatBytes(usage.storageLimit),
      freeText: formatBytes(Math.max(0, usage.storageLimit - usage.storageUsed)),
      usageText: `${formatBytes(usage.storageUsed)} z ${formatBytes(usage.storageLimit)}` } : {},
    badges: earned ? { count: earned.length, hasBadges: earned.length > 0,
      namesText: earned.map((badge) => badge.procedureName).join(', ') } : {},
  }
}
