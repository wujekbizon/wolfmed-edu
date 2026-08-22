import { shuffleArray } from '@/helpers/shuffleArray'
import type { Diagnoza, DiagnozyExamPayload } from '@/types/diagnozyTypes'

const DISTRACTOR_LIMITS = { diagnoza: 3, cele: 4, interwencje: 6, ocena: 3 }

function pool(items: string[], correct: string[], limit: number): string[] {
  const distractors = shuffleArray(
    [...new Set(items)].filter((item) => !correct.includes(item))
  ).slice(0, limit)
  return shuffleArray([...correct, ...distractors])
}

// Builds the exam payload for a drawn diagnosis: correct items merged with
// distractors pooled from sibling diagnoses, shuffled, without correctness
// flags — the client never learns which options are right before grading.
export function buildDiagnozyExam(
  drawn: Diagnoza,
  siblings: Diagnoza[]
): DiagnozyExamPayload {
  const correctInterwencje = drawn.interwencje.map((item) => item.interwencja)

  return {
    slug: drawn.slug,
    caseText: drawn.opisPrzypadku,
    steps: [
      {
        field: 'diagnoza',
        label: 'Diagnoza pielęgniarska',
        prompt: 'Wybierz poprawnie sformułowaną diagnozę pielęgniarską dla tego przypadku.',
        multi: false,
        options: pool(
          siblings.map((sibling) => sibling.diagnozaPielegniarska),
          [drawn.diagnozaPielegniarska],
          DISTRACTOR_LIMITS.diagnoza
        ),
      },
      {
        field: 'cele',
        label: 'Cel',
        prompt: 'Zaznacz wszystkie właściwe cele opieki.',
        multi: true,
        options: pool(
          siblings.flatMap((sibling) => sibling.celeOpieki),
          drawn.celeOpieki,
          DISTRACTOR_LIMITS.cele
        ),
      },
      {
        field: 'interwencje',
        label: 'Planowane interwencje',
        prompt: 'Zaznacz wszystkie interwencje właściwe dla tego przypadku.',
        multi: true,
        options: pool(
          siblings.flatMap((sibling) =>
            sibling.interwencje.map((item) => item.interwencja)
          ),
          correctInterwencje,
          DISTRACTOR_LIMITS.interwencje
        ),
      },
      {
        field: 'ocena',
        label: 'Ocena',
        prompt: 'Wybierz oczekiwany wynik opieki.',
        multi: false,
        options: pool(
          siblings.map((sibling) => sibling.oczekiwaneWyniki),
          [drawn.oczekiwaneWyniki],
          DISTRACTOR_LIMITS.ocena
        ),
      },
    ],
  }
}
