import { MONTH_ORDER } from '@/constants/practicalExamMonths'

export function getPracticalExamMonthRank(session: string): number {
  const month = session.split(' ')[0] ?? ''
  return MONTH_ORDER[month] ?? 0
}

