import { EXAM_PERIODS } from '@/constants/examDates'
import type { ExamStatus } from '@/types/examCountdownTypes'

/**
 * Calculates the time remaining until the next exam event or during current exam period
 * Uses UTC dates to ensure consistent calculations across server/client
 */
export function calculateTimeLeft(): ExamStatus {
  // Get current timestamp in milliseconds
  const now = Date.now()
  const polandTime = new Date(now)
  const polandTimestamp = polandTime.getTime()

  // Find current period using timestamp comparison
  const currentPeriod = EXAM_PERIODS.find((period) => {
    return polandTimestamp >= period.startDate.getTime() && polandTimestamp <= period.endDate.getTime()
  })

  if (!currentPeriod) {
    const nextPeriod = EXAM_PERIODS.find((period) => polandTimestamp < period.startDate.getTime())
    if (!nextPeriod) {
      return {
        timeLeft: { days: 0, hours: 0, minutes: 0, seconds: 0 },
        currentPeriod: null,
      }
    }

    const difference = nextPeriod.startDate.getTime() - polandTimestamp

    return {
      timeLeft: {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      },
      currentPeriod: nextPeriod,
    }
  }

  const difference = currentPeriod.endDate.getTime() - polandTimestamp

  return {
    timeLeft: {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    },
    currentPeriod,
  }
}

// Helper function to create dates in Poland timezone
export function createPolandDate(year: number, month: number, day: number, hour = 0, minute = 0, second = 0): Date {
  // Create date in UTC, accounting for Poland timezone
  const isDST = month >= 3 && month <= 10
  const offset = isDST ? 2 : 1 // UTC+2 in summer, UTC+1 in winter
  const date = new Date(Date.UTC(year, month - 1, day, hour - offset, minute, second))
  return date
}
