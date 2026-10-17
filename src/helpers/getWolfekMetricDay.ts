import { WOLFEK_REPORT_TIME_ZONE } from '@/constants/wolfekAdmin'

export function getWolfekMetricDay(date: Date): string {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: WOLFEK_REPORT_TIME_ZONE }).format(date)
}
