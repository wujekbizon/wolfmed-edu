import { EXAM_PERIODS } from '@/constants/examDates'
import type { ExamPeriod, ExamStatus } from '@/types/examCountdownTypes'

/**
 * Calculates the time remaining until the next exam event or during current exam period
 * Uses UTC dates to ensure consistent calculations across server/client
 */
export function calculateTimeLeft(): ExamStatus {
  // Get current timestamp in milliseconds
  const now = Date.now()
  const polandTime = new Date(now)
  const polandTimestamp = polandTime.getTime()

  // 1. First, try to find an ACTIVE period (in_progress, waiting_results, or a long countdown that is currently active)
  const activePeriod = EXAM_PERIODS.find((period) => {
    return polandTimestamp >= period.startDate.getTime() && polandTimestamp <= period.endDate.getTime()
  })

  if (activePeriod) {
    const difference = activePeriod.endDate.getTime() - polandTimestamp
    return {
      timeLeft: {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      },
      currentPeriod: activePeriod,
    }
  }

  // 2. If no period is currently active, find the NEXT upcoming period to countdown to
  const nextUpcomingPeriod = EXAM_PERIODS.find((period) => polandTimestamp < period.startDate.getTime())

  if (!nextUpcomingPeriod) {
    // No future periods
    return {
      timeLeft: { days: 0, hours: 0, minutes: 0, seconds: 0 },
      currentPeriod: null,
    }
  }

  // Construct a temporary ExamPeriod for the countdown state
  const difference = nextUpcomingPeriod.startDate.getTime() - polandTimestamp
  const countdownToNextPeriod: ExamPeriod = {
    startDate: polandTime, // Conceptual start for the countdown itself
    endDate: nextUpcomingPeriod.startDate, // Countdown until this date
    type: 'countdown',
    label:
      nextUpcomingPeriod.type === 'in_progress'
        ? `Czas do ${nextUpcomingPeriod.label.replace('Trwa', '').trim()}`
        : nextUpcomingPeriod.label,
  }

  return {
    timeLeft: {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    },
    currentPeriod: countdownToNextPeriod,
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
