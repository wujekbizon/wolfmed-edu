'use client'

import { useEffect, useRef } from 'react'
import { useUser } from '@clerk/nextjs'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchPracticeProgress } from '@/helpers/fetchPracticeProgress'
import { PracticeProgressError } from '@/lib/PracticeProgressError'
import { PRACTICE_STALE_TIME } from '@/constants/learningPractice'
import { newestPracticeView } from '@/helpers/newestPracticeView'
import type { PracticeView } from '@/types/learningPracticeTypes'

export function usePracticeSession(userId: string, category: string, initialSession: PracticeView | null) {
  const client = useQueryClient()
  const { user, isLoaded } = useUser()
  const authorized = !isLoaded || user?.id === userId
  const viewer = useRef<string | null>(null)
  viewer.current = authorized ? userId : null
  const mounted = useRef(true)
  useEffect(() => {
    mounted.current = true
    return () => { mounted.current = false }
  }, [])
  const key = ['learningPractice', userId, category]
  const query = useQuery({
    queryKey: key, queryFn: ({ signal }) => fetchPracticeProgress(userId, category, signal), initialData: initialSession,
    staleTime: PRACTICE_STALE_TIME, gcTime: 0, retry: false, enabled: isLoaded && authorized,
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
    if (!mounted.current || viewer.current !== userId || session.category !== category) return
    client.setQueryData<PracticeView | null>(key, (current) => newestPracticeView(current, session))
  }
  const signInRequired = query.error instanceof PracticeProgressError && query.error.status === 401
  return { ...query, authorized: authorized && !signInRequired, update }
}
