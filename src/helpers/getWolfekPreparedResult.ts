import type { QueryClient, QueryKey } from '@tanstack/react-query'
import { getWolfekPreparedBatch } from './getWolfekPreparedBatch'
import { toFormState } from './toFormState'
import type { WolfekPreparedActions } from '@/types/wolfekBatchTypes'
import type { WolfekQuestionState } from '@/types/wolfekResponseTypes'

export async function getWolfekPreparedResult(
  client: QueryClient, key: QueryKey, data: FormData,
  actions: WolfekPreparedActions, onLoading: () => void,
): Promise<WolfekQuestionState> {
  for (let attempt = 0; attempt < 2; attempt++) {
    const batch = await getWolfekPreparedBatch(client, key, async () => {
      onLoading()
      const loaded = await actions.load(data)
      if (!loaded.batch) throw new Error(loaded.message || 'Nie mogę pobrać odpowiedzi.')
      return loaded.batch
    })
    data.set('batchId', batch.id)
    const result = await actions.consume(data)
    if (!result.values?.batchInvalidated) return result
    client.removeQueries({ queryKey: key, exact: true })
    data.set('submissionId', crypto.randomUUID())
  }
  return { ...toFormState('ERROR', 'Dane zmieniły się podczas pytania. Spróbuj ponownie.'),
    answer: null, confidence: null }
}
