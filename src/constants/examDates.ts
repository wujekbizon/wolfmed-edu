import { ExamPeriod } from '@/types/examCountdownTypes'
import { createPolandDate } from '@/utils/dateUtils'

const today = new Date()
const currentYear = today.getFullYear()
const currentMonth = today.getMonth()
const currentDay = today.getDate()

export const EXAM_PERIODS: ExamPeriod[] = [
  {
    startDate: createPolandDate(
      currentDay < 15 ? currentYear : currentMonth === 11 ? currentYear + 1 : currentYear,
      currentMonth < 5 ? 2 : 9,
      15,
      6
    ),
    endDate: createPolandDate(2025, 1, 9, 5),
    type: 'countdown',
    label: 'Czas do zimowej sesji egzaminacyjnej',
  },
  {
    startDate: createPolandDate(2025, 1, 9, 6),
    endDate: createPolandDate(2025, 1, 20, 23, 59, 59),
    type: 'in_progress',
    label: 'Trwa zimowa sesja egzaminacyjna',
  },
  {
    startDate: createPolandDate(2025, 1, 21, 6),
    endDate: createPolandDate(2025, 3, 28, 23, 59, 59),
    type: 'waiting_results',
    label: 'Czas do ogłoszenia wyników',
  },
  {
    startDate: createPolandDate(2025, 1, 21, 7),
    endDate: createPolandDate(2025, 6, 2, 6),
    type: 'countdown',
    label: 'Czas do letniej sesji egzaminacyjnej',
  },
  {
    startDate: createPolandDate(2025, 6, 2, 7),
    endDate: createPolandDate(2025, 6, 21, 23, 59, 59),
    type: 'in_progress',
    label: 'Trwa letnia sesja egzaminacyjna',
  },
  {
    startDate: createPolandDate(2025, 6, 22, 6),
    endDate: createPolandDate(2025, 8, 29, 23, 59, 59),
    type: 'waiting_results',
    label: 'Czas do ogłoszenia wyników',
  },
]
