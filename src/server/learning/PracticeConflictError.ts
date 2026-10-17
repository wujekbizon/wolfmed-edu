import type { PracticeView } from '@/types/learningPracticeTypes'
import { PracticeError } from './PracticeError'

export class PracticeConflictError extends PracticeError {
  constructor(public readonly session: PracticeView) {
    super('Postęp zmienił się. Sprawdź aktualny stan i spróbuj ponownie.')
  }
}
