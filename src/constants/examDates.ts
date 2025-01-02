import { ExamPeriod } from '@/types/examCountdownTypes'
import { createPolandDate } from '@/utils/dateUtils'

export const EXAM_PERIODS: ExamPeriod[] = [
  {
    startDate: createPolandDate(2025, 1, 9),
    endDate: createPolandDate(2025, 1, 20, 23, 59, 59),
    type: 'countdown',
    label: 'Czas do zimowej sesji egzaminacyjnej',
  },
  {
    startDate: createPolandDate(2025, 1, 9),
    endDate: createPolandDate(2025, 1, 20, 23, 59, 59),
    type: 'in_progress',
    label: 'Trwa zimowa sesja egzaminacyjna',
  },
  {
    startDate: createPolandDate(2025, 1, 21),
    endDate: createPolandDate(2025, 3, 28, 23, 59, 59),
    type: 'waiting_results',
    label: 'Czas do ogłoszenia wyników',
  },
  {
    startDate: createPolandDate(2025, 6, 2),
    endDate: createPolandDate(2025, 6, 21, 23, 59, 59),
    type: 'countdown',
    label: 'Czas do letniej sesji egzaminacyjnej',
  },
  {
    startDate: createPolandDate(2025, 6, 2),
    endDate: createPolandDate(2025, 6, 21, 23, 59, 59),
    type: 'in_progress',
    label: 'Trwa letnia sesja egzaminacyjna',
  },
  {
    startDate: createPolandDate(2025, 6, 22),
    endDate: createPolandDate(2025, 8, 29, 23, 59, 59),
    type: 'waiting_results',
    label: 'Czas do ogłoszenia wyników',
  },
]
