import { toFormState } from '@/helpers/toFormState'
import type { PracticeFormAction } from '@/types/learningPracticeTypes'

export function withPracticeTransportRecovery(action: PracticeFormAction): PracticeFormAction {
  return async (previous, data) => {
    try {
      return await action(previous, data)
    } catch (error) {
      if (!(error instanceof TypeError) ||
        !/^(Failed to fetch|Load failed|NetworkError when attempting to fetch resource\.)( \([^)]+\))?$/.test(error.message)) {
        throw error
      }
      return {
        ...toFormState('ERROR', 'Nie udało się potwierdzić zapisu. Sprawdź połączenie i ponów próbę.'),
        session: previous.session,
      }
    }
  }
}
