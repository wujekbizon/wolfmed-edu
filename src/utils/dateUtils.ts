interface ExamPeriod {
  startDate: Date
  endDate: Date
  type: 'countdown' | 'in_progress' | 'waiting_results'
  label: string
}

const EXAM_PERIODS: ExamPeriod[] = [
  {
    startDate: new Date('2025-01-09T00:00:00+01:00'),
    endDate: new Date('2025-01-20T23:59:59+01:00'),
    type: 'countdown',
    label: 'Czas do zimowej sesji egzaminacyjnej',
  },
  {
    startDate: new Date('2025-01-09T00:00:00+01:00'),
    endDate: new Date('2025-01-20T23:59:59+01:00'),
    type: 'in_progress',
    label: 'Trwa zimowa sesja egzaminacyjna',
  },
  {
    startDate: new Date('2025-01-21T00:00:00+01:00'),
    endDate: new Date('2025-03-28T23:59:59+01:00'),
    type: 'waiting_results',
    label: 'Czas do ogłoszenia wyników',
  },
  {
    startDate: new Date('2025-06-02T00:00:00+02:00'),
    endDate: new Date('2025-06-21T23:59:59+02:00'),
    type: 'countdown',
    label: 'Czas do letniej sesji egzaminacyjnej',
  },
  {
    startDate: new Date('2025-06-02T00:00:00+02:00'),
    endDate: new Date('2025-06-21T23:59:59+02:00'),
    type: 'in_progress',
    label: 'Trwa letnia sesja egzaminacyjna',
  },
  {
    startDate: new Date('2025-06-22T00:00:00+02:00'),
    endDate: new Date('2025-08-29T23:59:59+02:00'),
    type: 'waiting_results',
    label: 'Czas do ogłoszenia wyników',
  },
]

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

interface ExamStatus {
  timeLeft: TimeLeft
  currentPeriod: ExamPeriod | null
}

const calculations = {
  days: (difference: number) => Math.floor(difference / (1000 * 60 * 60 * 24)),
  hours: (difference: number) => Math.floor((difference / (1000 * 60 * 60)) % 24),
  minutes: (difference: number) => Math.floor((difference / 1000 / 60) % 60),
  seconds: (difference: number) => Math.floor((difference / 1000) % 60),
} as const

export function calculateTimeLeft(): ExamStatus {
  const now = new Date()
  const polandTime = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Warsaw' }))

  const currentPeriod = EXAM_PERIODS.find((period) => {
    return polandTime >= period.startDate && polandTime <= period.endDate
  })

  if (!currentPeriod) {
    // Find the next upcoming period
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
