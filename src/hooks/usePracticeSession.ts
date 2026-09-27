'use client'

import { useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getPracticeAction } from '@/actions/learning-practice'
import { PRACTICE_STALE_TIME } from '@/constants/learningPractice'
import { newestPracticeView } from '@/helpers/newestPracticeView'
import type { PracticeView } from '@/types/learningPracticeTypes'

export function usePracticeSession(userId: string, category: string, initialSession: PracticeView | null) {
  const client = useQueryClient()
  const { user, isLoaded } = useUser()
  const authorized = !isLoaded || user?.id === userId
  const key = ['learningPractice', userId, category]
  const query = useQuery({
    queryKey: key, queryFn: () => getPracticeAction(category), initialData: initialSession,
    staleTime: PRACTICE_STALE_TIME, gcTime: 0, retry: false, enabled: authorized,
    structuralSharing: (oldData, newData) => {
      const previous = oldData as PracticeView | null | undefined
      const next = newData as PracticeView | null
      return newestPracticeView(previous, next)
    },
  })
  useEffect(() => {
    if (isLoaded && user?.id !== userId) {
      client.removeQueries({ queryKey: ['learningPractice', userId] })
      client.removeQueries({ queryKey: ['learningQuestions', userId] })
    }
  }, [client, isLoaded, user?.id, userId])
  const update = (session: PracticeView) => {
    client.setQueryData<PracticeView | null>(key, (current) => newestPracticeView(current, session))
  }
  return { ...query, authorized, update }
}
