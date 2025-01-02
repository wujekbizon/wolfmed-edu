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
  // Get current time in Poland's timezone
  const now = new Date()
  const polandTime = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Warsaw' }))

  // Check if we're currently in an exam period
  const currentPeriod = EXAM_PERIODS.find((period) => {
    return polandTime >= period.startDate && polandTime <= period.endDate
  })

  if (!currentPeriod) {
    // If not in a period, find the next upcoming one
    const nextPeriod = EXAM_PERIODS.find((period) => polandTime < period.startDate)

    if (!nextPeriod) {
      // No upcoming periods found
      return {
        timeLeft: { days: 0, hours: 0, minutes: 0, seconds: 0 },
        currentPeriod: null,
      }
    }

    // Calculate time until next period starts
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

  // Calculate time until current period ends
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
