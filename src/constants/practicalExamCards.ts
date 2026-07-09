export interface PracticalExamCardMetadata {
  image: string
  badge: string
  ctaLabel: string
}

export const DEFAULT_PRACTICAL_EXAM_METADATA: PracticalExamCardMetadata = {
  image: 'https://zw3dk8dyy9.ufs.sh/f/UVAwLrIxs2k5edFR4UhPYN5fnAqMm3rc0CKDb7LHTkptIj9o',
  badge: 'Część praktyczna · MED.14',
  ctaLabel: 'Rozpocznij arkusz',
}

export interface PracticalExamAICardMetadata {
  image: string
  title: string
  description: string
  aiBadge: string
  ctaLabel: string
  lockedLabel: string
}

export const PRACTICAL_EXAM_AI_CARD: PracticalExamAICardMetadata = {
  image: 'https://zw3dk8dyy9.ufs.sh/f/UVAwLrIxs2k5H6zCTyRXZAfUgQh6yMWki0EFjo5rbcJDS2mP',
  title: 'Egzamin generowany przez AI',
  description:
    'Wygeneruj nieograniczoną liczbę nowych arkuszy praktycznych. AI ułoży świeży przypadek pacjenta i karty do uzupełnienia w oparciu o wymagania egzaminu MED.14, a Ty sprawdzisz się tak samo jak na prawdziwych arkuszach.',
  aiBadge: 'Generowane przez AI',
  ctaLabel: 'Wygeneruj nowy arkusz',
  lockedLabel: 'Tylko premium',
}
