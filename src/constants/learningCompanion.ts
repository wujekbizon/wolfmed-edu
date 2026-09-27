import type { JevSupportAction } from '@/types/learningPracticeTypes'

export const COMPANION_SUGGESTIONS: Record<JevSupportAction, string> = {
  hint: 'Porównaj słowa pytania ze swoją odpowiedzią.',
  compare: 'Zestaw swój wybór z innymi odpowiedziami z karty.',
  retry: 'Spróbuj wybrać inną odpowiedź i sprawdź swój tok rozumowania.',
  reveal: 'Sprawdź zapisaną odpowiedź, gdy będziesz gotowy.',
  tutor: 'Kilka kart sprawiło trudność. Możemy omówić tę kartę z asystentem; najpierw ujawnimy odpowiedź.',
  material: 'Wróć do materiału powiązanego z tym pytaniem.',
  plan: 'Wróć do kolejnego kroku w swoim planie nauki.',
  continue: 'Możesz przejść do następnej karty.',
}
