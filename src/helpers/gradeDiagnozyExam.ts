import type {
  Diagnoza,
  DiagnozyExamAnswers,
  DiagnozyExamResult,
  DiagnozyExamStepResult,
} from '@/types/diagnozyTypes'

export const DIAGNOZY_EXAM_PASS_THRESHOLD = 75

function gradeStep(
  field: DiagnozyExamStepResult['field'],
  label: string,
  correct: string[],
  chosen: string[]
): DiagnozyExamStepResult {
  const hits = chosen.filter((item) => correct.includes(item))
  const missed = correct.filter((item) => !chosen.includes(item))
  const extra = chosen.filter((item) => !correct.includes(item))
  const scorePercent =
    correct.length === 0
      ? 0
      : Math.round(
          (Math.max(0, hits.length - extra.length) / correct.length) * 100
        )
  return { field, label, hits, missed, extra, scorePercent }
}

// Pure grader: chosen vs the book's correct sets; extras subtract from hits so
// "select everything" never pays off. Reused by any future exam variant.
export function gradeDiagnozyExam(
  diagnoza: Diagnoza,
  answers: DiagnozyExamAnswers
): DiagnozyExamResult {
  const steps = [
    gradeStep('diagnoza', 'Diagnoza pielęgniarska', [diagnoza.diagnozaPielegniarska], answers.diagnoza),
    gradeStep('cele', 'Cel', diagnoza.celeOpieki, answers.cele),
    gradeStep(
      'interwencje',
      'Planowane interwencje',
      diagnoza.interwencje.map((item) => item.interwencja),
      answers.interwencje
    ),
    gradeStep('ocena', 'Ocena', [diagnoza.oczekiwaneWyniki], answers.ocena),
  ]

  const score = Math.round(
    steps.reduce((sum, step) => sum + step.scorePercent, 0) / steps.length
  )

  return {
    score,
    passed: score >= DIAGNOZY_EXAM_PASS_THRESHOLD,
    steps,
    uzasadnienia: Object.fromEntries(
      diagnoza.interwencje.map((item) => [item.interwencja, item.uzasadnienie])
    ),
  }
}
