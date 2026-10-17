import type { WolfekQuestionState } from '@/types/wolfekResponseTypes'

export const WOLFEK_RESPONSE_VERSION = 'wolfek-responses-v2'
export const WOLFEK_RESPONSE_RETRY_SECONDS = 300
export const EMPTY_WOLFEK_QUESTION: WolfekQuestionState = {
  status: 'UNSET', message: '', fieldErrors: {}, timestamp: 0, answer: null, confidence: null,
}
export const WOLFEK_FACT_LABELS: Record<string, string> = {
  access: 'dostęp do kursów', catalog: 'informacje o kursie', payments: 'informacje o płatnościach',
  video: 'prezentacja kursu', results: 'wyniki testów', selectedTest: 'wybrany test',
  plan: 'plan nauki', exam: 'odliczanie', storage: 'miejsce na dysku', badges: 'odznaki',
  card: 'bieżąca karta', material: 'materiał do pytania', navigation: 'kolejna karta',
  recommendation: 'propozycja pomocy', review: 'karta do powtórki',
}
