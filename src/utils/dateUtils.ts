import { EXAM_PERIODS } from '@/constants/examDates'
import { ExamStatus } from '@/types/examCountdownTypes'

const calculations = {
  days: (difference: number) => Math.floor(difference / (1000 * 60 * 60 * 24)),
  hours: (difference: number) => Math.floor((difference / (1000 * 60 * 60)) % 24),
  minutes: (difference: number) => Math.floor((difference / 1000 / 60) % 60),
  seconds: (difference: number) => Math.floor((difference / 1000) % 60),
} as const

/**
 * Calculates the time remaining until the next exam event or during current exam period
 *
 * The function:
 * 1. Gets current time in Poland timezone
 * 2. Finds if we're currently in an exam period
 * 3. If not in a period, finds the next upcoming period
 * 4. Calculates the time difference to either:
 *    - The start of the next period (for countdown)
 *    - The end of current period (for in_progress/waiting_results)
 *
 * @returns {ExamStatus} Object containing:
 *  - timeLeft: remaining time in days, hours, minutes, seconds
 *  - currentPeriod: the current or next exam period details
 */
export function calculateTimeLeft(): ExamStatus {
  // Get current time in UTC
  const now = new Date()

  // Convert to Poland time more reliably
  const polandOffset = now.getTimezoneOffset() + (new Date().getMonth() >= 2 && new Date().getMonth() <= 9 ? 120 : 60)
  const polandTime = new Date(now.getTime() + polandOffset * 60000)

  // Find current period
  const currentPeriod = EXAM_PERIODS.find((period) => {
    return polandTime >= period.startDate && polandTime <= period.endDate
  })

  if (!currentPeriod) {
    const nextPeriod = EXAM_PERIODS.find((period) => polandTime < period.startDate)
    if (!nextPeriod) {
      return {
        timeLeft: { days: 0, hours: 0, minutes: 0, seconds: 0 },
        currentPeriod: null,
      }
    }

    const difference = nextPeriod.startDate.getTime() - polandTime.getTime()
    return {
      timeLeft: {
        days: calculations.days(difference),
        hours: calculations.hours(difference),
        minutes: calculations.minutes(difference),
        seconds: calculations.seconds(difference),
      },
      currentPeriod: nextPeriod,
    }
  }

  const difference = currentPeriod.endDate.getTime() - polandTime.getTime()
  return {
    timeLeft: {
      days: calculations.days(difference),
      hours: calculations.hours(difference),
      minutes: calculations.minutes(difference),
      seconds: calculations.seconds(difference),
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
