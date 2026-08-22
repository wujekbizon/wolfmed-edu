import type { DiagnozyExamAnswers } from '@/types/diagnozyTypes'

export const EXAM_DURATION_MINUTES = 30

/** The mannequin "Wykonanie" step is injected between Interwencje and Ocena. */
export const WYKONANIE_INDEX = 3

export const EMPTY_ANSWERS: DiagnozyExamAnswers = {
  diagnoza: [],
  cele: [],
  interwencje: [],
  ocena: [],
}
