'use client'

import { useEffect, useRef } from 'react'
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
  const viewer = useRef<string | null>(null)
  viewer.current = authorized ? userId : null
  const mounted = useRef(true)
  useEffect(() => {
    mounted.current = true
    return () => { mounted.current = false }
  }, [])
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
    if (!mounted.current || viewer.current !== userId || session.category !== category) return
    client.setQueryData<PracticeView | null>(key, (current) => newestPracticeView(current, session))
  }
  return { ...query, authorized, update }
}
