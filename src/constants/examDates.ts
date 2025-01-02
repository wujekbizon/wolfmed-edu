import { ExamPeriod } from '@/types/examCountdownTypes'

export const EXAM_PERIODS: ExamPeriod[] = [
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
