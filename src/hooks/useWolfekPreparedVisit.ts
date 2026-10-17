'use client'

import { useContext } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { WolfekVisit } from '@/components/wolfek/WolfekVisitProvider'
import { getWolfekPreparedResult } from '@/helpers/getWolfekPreparedResult'
import { getWolfekPreparedScope } from '@/helpers/getWolfekPreparedScope'
import { getWolfekPreparedBatchAction, useWolfekPreparedResultAction } from '@/actions/wolfek-prepared'
import type { WolfekQuestionProps, WolfekQuestionState } from '@/types/wolfekResponseTypes'

export function useWolfekPreparedVisit({ route, practice }: WolfekQuestionProps) {
  const visit = useContext(WolfekVisit)
  if (!visit) throw new Error('Wolfek wymaga kontekstu wizyty.')
  const client = useQueryClient()
  const key = ['wolfek-prepared', visit.id, visit.viewer, route, getWolfekPreparedScope(practice)]
  const usePrepared = async (data: FormData, onLoading: () => void): Promise<WolfekQuestionState> => {
    data.set('visitId', visit.getVisitId())
    return getWolfekPreparedResult(client, key, data,
      { load: getWolfekPreparedBatchAction, consume: useWolfekPreparedResultAction }, onLoading)
  }
  return { visit, usePrepared }
}
