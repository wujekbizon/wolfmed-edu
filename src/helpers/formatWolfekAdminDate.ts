import { WOLFEK_REPORT_TIME_ZONE } from '@/constants/wolfekAdmin'

export function formatWolfekAdminDate(value: string): string {
  return new Intl.DateTimeFormat('pl-PL', { dateStyle: 'short', timeStyle: 'short',
    timeZone: WOLFEK_REPORT_TIME_ZONE }).format(new Date(value))
}
