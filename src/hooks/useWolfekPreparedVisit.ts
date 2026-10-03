'use client'

import { useContext } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { WolfekVisit } from '@/components/wolfek/WolfekVisitProvider'
import { getWolfekPreparedBatch } from '@/helpers/getWolfekPreparedBatch'
import { getWolfekPreparedBatchAction, useWolfekPreparedResultAction } from '@/actions/wolfek-prepared'
import type { WolfekQuestionProps, WolfekQuestionState } from '@/types/wolfekResponseTypes'

export function useWolfekPreparedVisit({ route, practice }: WolfekQuestionProps) {
  const visit = useContext(WolfekVisit)
  if (!visit) throw new Error('Wolfek wymaga kontekstu wizyty.')
  const client = useQueryClient()
  const key = ['wolfek-prepared', visit.id, visit.viewer, route, JSON.stringify(practice ?? null)]
  const usePrepared = async (data: FormData, onLoading: () => void): Promise<WolfekQuestionState> => {
    data.set('visitId', visit.getVisitId())
    for (let attempt = 0; attempt < 2; attempt++) {
      const batch = await getWolfekPreparedBatch(client, key, async () => {
        onLoading()
        const loaded = await getWolfekPreparedBatchAction(data)
        if (!loaded.batch) throw new Error(loaded.message || 'Nie mogę pobrać odpowiedzi.')
        return loaded.batch
      })
      data.set('batchId', batch.id)
      const result = await useWolfekPreparedResultAction(data)
      if (!result.values?.batchInvalidated) return result
      client.removeQueries({ queryKey: key, exact: true })
    }
    return { status: 'ERROR', message: 'Dane zmieniły się podczas pytania. Spróbuj ponownie.',
      fieldErrors: {}, timestamp: Date.now(), answer: null, confidence: null }
  }
  return { visit, usePrepared }
}
