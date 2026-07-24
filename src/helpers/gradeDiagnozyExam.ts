import { BODY_ZONE_LABELS } from '@/types/diagnozyTypes'
import type {
  BodyZoneAssignments,
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

// Mannequin execution: chosen-correct interventions with an authored bodyZone
// must be assigned the right zone. Skipped when nothing is gradeable.
function gradeWykonanie(
  diagnoza: Diagnoza,
  chosen: string[],
  zones: BodyZoneAssignments
): DiagnozyExamStepResult | null {
  const gradeable = diagnoza.interwencje.filter(
    (item) => item.exam?.bodyZone && chosen.includes(item.interwencja)
  )
  if (gradeable.length === 0) return null

  const hits: string[] = []
  const extra: string[] = []
  const missed: string[] = []
  for (const item of gradeable) {
    const correctZone = item.exam!.bodyZone
    const assigned = zones[item.interwencja]
    if (assigned === correctZone) {
      hits.push(`${item.interwencja} — ${BODY_ZONE_LABELS[correctZone]}`)
    } else if (assigned) {
      extra.push(
        `${item.interwencja} — wybrano: ${BODY_ZONE_LABELS[assigned]}, poprawnie: ${BODY_ZONE_LABELS[correctZone]}`
      )
    } else {
      missed.push(
        `${item.interwencja} — nie wskazano miejsca (poprawnie: ${BODY_ZONE_LABELS[correctZone]})`
      )
    }
  }

  return {
    field: 'wykonanie',
    label: 'Wykonanie na fantomie',
    hits,
    missed,
    extra,
    scorePercent: Math.round((hits.length / gradeable.length) * 100),
  }
}

// Pure grader: chosen vs the book's correct sets; extras subtract from hits so
// "select everything" never pays off. Reused by any future exam variant.
export function gradeDiagnozyExam(
  diagnoza: Diagnoza,
  answers: DiagnozyExamAnswers,
  zones: BodyZoneAssignments = {}
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

  const wykonanie = gradeWykonanie(diagnoza, answers.interwencje, zones)
  if (wykonanie) steps.splice(3, 0, wykonanie)

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
