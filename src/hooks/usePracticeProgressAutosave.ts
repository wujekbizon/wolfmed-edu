import { useCallback, useEffect, useRef, useState } from 'react'
import { savePracticeProgressAction } from '@/actions/savePracticeProgress'

type SaveStatus = 'saved' | 'unsaved' | 'saving' | 'error'

export function usePracticeProgressAutosave(
  sessionId: string,
  initialProgress: Record<string, number>
) {
  const dirtyRef = useRef<Record<string, number>>({})
  const savedRef = useRef({ ...initialProgress })
  const inFlightRef = useRef<Record<string, number>>({})
  const savingRef = useRef(false)
  const [status, setStatus] = useState<SaveStatus>('saved')

  const flush = useCallback(async () => {
    if (savingRef.current || !Object.keys(dirtyRef.current).length) return
    const batch = { ...dirtyRef.current }
    inFlightRef.current = batch
    savingRef.current = true
    setStatus('saving')
    try {
      const result = await savePracticeProgressAction({ sessionId, answers: batch })
      if (!result.success) throw new Error(result.message)
      for (const [questionId, answerIndex] of Object.entries(batch)) {
        savedRef.current[questionId] = answerIndex
        if (dirtyRef.current[questionId] === answerIndex) delete dirtyRef.current[questionId]
      }
      setStatus(Object.keys(dirtyRef.current).length ? 'unsaved' : 'saved')
    } catch {
      setStatus('error')
    } finally {
      inFlightRef.current = {}
      savingRef.current = false
    }
  }, [sessionId])

  const sendBeacon = useCallback(() => {
    const answers = dirtyRef.current
    if (!Object.keys(answers).length) return
    const body = new Blob([JSON.stringify({ sessionId, answers })], { type: 'application/json' })
    if (navigator.sendBeacon('/api/session/practice-progress', body)) return
    void fetch('/api/session/practice-progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, answers }),
      keepalive: true,
    }).catch(() => undefined)
  }, [sessionId])

  const selectAnswer = useCallback((questionId: string, answerIndex: number) => {
    if (savedRef.current[questionId] === answerIndex && inFlightRef.current[questionId] === undefined) {
      delete dirtyRef.current[questionId]
    }
    else dirtyRef.current[questionId] = answerIndex
    setStatus(Object.keys(dirtyRef.current).length ? 'unsaved' : 'saved')
  }, [])

  useEffect(() => {
    const timer = window.setInterval(() => void flush(), 10_000)
    const onVisibilityChange = () => { if (document.hidden) sendBeacon() }
    const onPageHide = () => sendBeacon()
    const onHistoryNavigation = () => sendBeacon()
    const onNavigationClick = (event: MouseEvent) => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
      const target = event.target
      if (!(target instanceof Element)) return
      const anchor = target.closest<HTMLAnchorElement>('a[href]')
      if (!anchor || anchor.target === '_blank' || anchor.hasAttribute('download')) return
      const destination = new URL(anchor.href)
      if (destination.origin !== window.location.origin) return
      if (destination.pathname === window.location.pathname && destination.search === window.location.search) return
      sendBeacon()
    }

    document.addEventListener('click', onNavigationClick, true)
    document.addEventListener('visibilitychange', onVisibilityChange)
    window.addEventListener('pagehide', onPageHide)
    window.addEventListener('popstate', onHistoryNavigation)
    return () => {
      window.clearInterval(timer)
      document.removeEventListener('click', onNavigationClick, true)
      document.removeEventListener('visibilitychange', onVisibilityChange)
      window.removeEventListener('pagehide', onPageHide)
      window.removeEventListener('popstate', onHistoryNavigation)
      sendBeacon()
    }
  }, [flush, sendBeacon])

  return { selectAnswer, status }
}
