const EXAM_START_DATE = new Date('2025-01-09T00:00:00+01:00')

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

// Memoize the calculation functions
const calculations = {
  days: (difference: number) => Math.floor(difference / (1000 * 60 * 60 * 24)),
  hours: (difference: number) => Math.floor((difference / (1000 * 60 * 60)) % 24),
  minutes: (difference: number) => Math.floor((difference / 1000 / 60) % 60),
  seconds: (difference: number) => Math.floor((difference / 1000) % 60),
} as const

export function calculateTimeLeft(): TimeLeft {
  const now = new Date()
  const polandTime = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Warsaw' }))
  const difference = EXAM_START_DATE.getTime() - polandTime.getTime()

  if (difference <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    }
  }

  return {
    days: calculations.days(difference),
    hours: calculations.hours(difference),
    minutes: calculations.minutes(difference),
    seconds: calculations.seconds(difference),
  }
}
