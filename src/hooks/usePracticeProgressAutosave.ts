import { useCallback, useRef, useState } from 'react'
import { savePracticeProgressAction } from '@/actions/savePracticeProgress'
import { usePracticeProgressNavigation } from '@/hooks/usePracticeProgressNavigation'
import type { PracticeAnswerUpdates, PracticeProgressVersions, PracticeSaveStatus } from '@/types/testTypes'

export function usePracticeProgressAutosave(sessionId: string, initialVersions: PracticeProgressVersions) {
  const dirtyRef = useRef<PracticeAnswerUpdates>({})
  const baseVersionsRef = useRef(initialVersions)
  const versionsRef = useRef({ ...initialVersions })
  const clientIdRef = useRef<string | null>(null)
  const savingRef = useRef(false)
  const conflictRef = useRef(false)
  const stoppedRef = useRef(false)
  const lastBeaconRef = useRef({ payload: '', sentAt: 0 })
  const [status, setStatus] = useState<PracticeSaveStatus>('saved')

  const stop = useCallback(() => {
    stoppedRef.current = true
    dirtyRef.current = {}
    setStatus('saved')
  }, [])

  const flush = useCallback(async () => {
    if (stoppedRef.current || document.hidden) return
    if (conflictRef.current || savingRef.current || !Object.keys(dirtyRef.current).length) return
    const batch = { ...dirtyRef.current }
    savingRef.current = true
    setStatus('saving')
    try {
      const result = await savePracticeProgressAction({ sessionId, answers: batch })
      if (stoppedRef.current) return
      if (!result.success) {
        if ('conflict' in result && result.conflict) {
          conflictRef.current = true
          setStatus('conflict')
          return
        }
        throw new Error(result.message)
      }
      if ('completed' in result && result.completed) { stop(); return }
      for (const [id, update] of Object.entries(batch)) {
        if (dirtyRef.current[id]?.revision === update.revision) delete dirtyRef.current[id]
      }
      setStatus(Object.keys(dirtyRef.current).length ? 'unsaved' : 'saved')
    } catch {
      if (!stoppedRef.current) setStatus('error')
    } finally {
      savingRef.current = false
    }
  }, [sessionId, stop])

  const sendBeacon = useCallback(() => {
    const answers = dirtyRef.current
    if (stoppedRef.current || conflictRef.current || !Object.keys(answers).length) return
    const payload = JSON.stringify({ sessionId, answers })
    const now = Date.now()
    if (lastBeaconRef.current.payload === payload && now - lastBeaconRef.current.sentAt < 1_000) return
    const body = new Blob([payload], { type: 'application/json' })
    lastBeaconRef.current = { payload, sentAt: now }
    if (navigator.sendBeacon('/api/session/practice-progress', body)) return
    void fetch('/api/session/practice-progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
      keepalive: true,
    }).catch(() => undefined)
  }, [sessionId])

  const selectAnswer = useCallback((questionId: string, answerIndex: number) => {
    if (stoppedRef.current) return
    clientIdRef.current ??= crypto.randomUUID()
    const revision = (versionsRef.current[questionId]?.revision ?? 0) + 1
    const update = {
      answerIndex, revision, clientId: clientIdRef.current,
      baseRevision: baseVersionsRef.current[questionId]?.revision ?? 0,
    }
    versionsRef.current[questionId] = update
    dirtyRef.current[questionId] = update
    setStatus(conflictRef.current ? 'conflict' : 'unsaved')
  }, [])

  usePracticeProgressNavigation(flush, sendBeacon)
  return { selectAnswer, status, stop }
}
