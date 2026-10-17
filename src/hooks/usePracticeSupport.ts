'use client'

import { startTransition, useEffect, useRef } from 'react'
import { selectPracticeSupportAction } from '@/actions/learning-support'
import type { PracticeView } from '@/types/learningPracticeTypes'

export function usePracticeSupport(session: PracticeView | null, onSaved: (session: PracticeView) => void) {
  const requests = useRef(new Map<string, ReturnType<typeof selectPracticeSupportAction>>())
  const callback = useRef(onSaved)
  useEffect(() => { callback.current = onSaved }, [onSaved])
  useEffect(() => {
    if (!session?.question?.supportPending) return
    const key = `${session.id}:${session.version}`
    if (!requests.current.has(key)) {
      startTransition(() => {
        const request = selectPracticeSupportAction({ category: session.category,
          sessionId: session.id, version: session.version }).catch(() => null)
        requests.current.set(key, request)
      })
    }
    const activeRequest = requests.current.get(key)
    if (!activeRequest) return
    let stale = false
    void activeRequest
      .then((result) => { if (!stale && result) callback.current(result) })
      .catch(() => undefined)
    return () => { stale = true }
  }, [session])
}
