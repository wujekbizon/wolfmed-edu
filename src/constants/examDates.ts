import { ExamPeriod } from '@/types/examCountdownTypes'
import { createPolandDate } from '@/utils/dateUtils'

const generateExamPeriods = (startYear: number, yearsToGenerate: number): ExamPeriod[] => {
  const periods: ExamPeriod[] = []

  for (let year = startYear; year < startYear + yearsToGenerate; year++) {
    periods.push(
      {
        startDate: createPolandDate(year - 1, 1, 1, 0, 0, 0),
        endDate: createPolandDate(year, 1, 8, 5),
        type: 'countdown',
        label: `Czas do zimowej sesji egzaminacyjnej ${year}`,
      },
      {
        startDate: createPolandDate(year, 1, 8, 6),
        endDate: createPolandDate(year, 1, 20, 23, 59, 59),
        type: 'in_progress',
        label: `Trwa zimowa sesja egzaminacyjna ${year}`,
      },
      {
        startDate: createPolandDate(year, 1, 21, 6),
        endDate: createPolandDate(year, 3, 28, 23, 59, 59),
        type: 'waiting_results',
        label: `Czas do ogłoszenia wyników zimowej sesji ${year}`,
      },
      // Summer Session
      {
        startDate: createPolandDate(year, 3, 29, 6),
        endDate: createPolandDate(year, 6, 2, 6),
        type: 'countdown',
        label: `Czas do letniej sesji egzaminacyjnej ${year}`,
      },
      {
        startDate: createPolandDate(year, 6, 2, 7),
        endDate: createPolandDate(year, 6, 21, 23, 59, 59),
        type: 'in_progress',
        label: `Trwa letnia sesja egzaminacyjna ${year}`,
      },
      {
        startDate: createPolandDate(year, 6, 22, 6),
        endDate: createPolandDate(year, 8, 29, 23, 59, 59),
        type: 'waiting_results',
        label: `Czas do ogłoszenia wyników letniej sesji ${year}`,
      },
    )
  }
  return periods
}

export const EXAM_PERIODS: ExamPeriod[] = generateExamPeriods(2025, 5)
