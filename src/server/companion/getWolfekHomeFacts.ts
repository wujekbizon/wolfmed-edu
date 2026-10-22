import 'server-only'
import { formatBytes } from '@/helpers/formatBytes'
import { getUserBadges, getUserStorageUsage } from '@/server/queries'
import { getWolfekPlanFacts } from './getWolfekPlanFacts'
import { getWolfekBillingFacts } from './getWolfekBillingFacts'

export async function getWolfekHomeFacts(userId: string, opiekun: boolean, groups?: ReadonlySet<string>) {
  const [plan, billing, storage, badges] = await Promise.allSettled([
    !groups || groups.has('plan') || groups.has('exam') ? getWolfekPlanFacts(userId, opiekun) : Promise.resolve(null),
    !groups || groups.has('billing') ? getWolfekBillingFacts(userId) : Promise.resolve(null),
    !groups || groups.has('storage') ? getUserStorageUsage(userId) : Promise.resolve(null),
    !groups || groups.has('badges') ? getUserBadges(userId) : Promise.resolve(null),
  ])
  const usage = storage.status === 'fulfilled' ? storage.value : null
  const earned = badges.status === 'fulfilled' ? badges.value : null
  return {
    ...(plan.status === 'fulfilled' && plan.value ? plan.value : { plan: {}, exam: {} }),
    billing: billing.status === 'fulfilled' && billing.value ? billing.value : {},
    storage: usage ? { usedText: formatBytes(usage.storageUsed), limitText: formatBytes(usage.storageLimit),
      freeText: formatBytes(Math.max(0, usage.storageLimit - usage.storageUsed)),
      usageText: `${formatBytes(usage.storageUsed)} z ${formatBytes(usage.storageLimit)}` } : {},
    badges: earned ? { count: earned.length, hasBadges: earned.length > 0,
      namesText: earned.map((badge) => badge.procedureName).join(', ') } : {},
  }
}
