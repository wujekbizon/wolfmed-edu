import 'server-only'
import { getBillingOverview } from '@/server/payments/getBillingOverview'
import { getSubscriptionBillingDate } from '@/helpers/getSubscriptionBillingDate'
import { careerPathsData } from '@/constants/careerPathsData'

export async function getWolfekBillingFacts(userId: string) {
  const billing = await getBillingOverview(userId)
  const subscriptions = billing.subscriptions.map((item) => {
    const date = getSubscriptionBillingDate(item)
    return `${careerPathsData[item.courseSlug]?.title ?? item.courseSlug}: ${item.accessTier}, status ${item.status}${
      date ? `, ${date.label} ${date.date.toLocaleDateString('pl-PL', { timeZone: 'Europe/Warsaw' })}` : ''}`
  })
  const lifetime = billing.lifetime.map((item) => `${careerPathsData[item.courseSlug]?.title ?? item.courseSlug}: ${item.accessTier}, dostęp bez subskrypcji`)
  return { summaryText: [...subscriptions, ...lifetime].join('; ') || 'brak zakupów do wyświetlenia',
    manageable: billing.subscriptions.some((item) => ['active', 'trialing', 'past_due', 'unpaid', 'paused'].includes(item.status)),
    cancellationEffectiveText: 'Portal płatności pokaże status i termin zakończenia Twojego dostępu.' }
}
