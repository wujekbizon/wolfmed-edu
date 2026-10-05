import 'server-only'
import { getPlanProgress } from '@/server/planner/progress'
import { calculateTimeLeft } from '@/utils/dateUtils'

export async function getWolfekPlanFacts(userId: string, opiekun: boolean) {
  const plan = await getPlanProgress(userId)
  const exam = opiekun ? calculateTimeLeft() : null
  const remaining = plan?.suggestion?.remainingMinutesToday ?? 0
  return { plan: {
    active: Boolean(plan), dueDateText: plan ? new Date(plan.plan.dueDate).toLocaleDateString('pl-PL', { timeZone: 'Europe/Warsaw' }) : null,
    daysLeft: plan?.daysLeft ?? null, todayHasTask: remaining > 0,
    todayDone: Boolean(plan?.todayIsStudyDay && plan.todayMinutes >= plan.plan.minutesPerDay),
    todayActivityText: plan?.suggestion?.label ?? null, remainingMinutesToday: remaining,
    nextActivityText: plan?.suggestion?.label ?? 'Otwórz plan, aby sprawdzić kolejne zaplanowane zadania.',
    attributedMinutes: plan?.attributedMinutes ?? null, plannedTotalMinutes: plan?.plannedTotalMinutes ?? null,
  }, exam: { available: Boolean(exam?.currentPeriod), periodLabel: exam?.currentPeriod?.label ?? null,
    dateText: exam?.currentPeriod?.endDate.toLocaleDateString('pl-PL', { timeZone: 'Europe/Warsaw' }) ?? null,
    daysLeft: exam?.timeLeft.days ?? null } }
}
