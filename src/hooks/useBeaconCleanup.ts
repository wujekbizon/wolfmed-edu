import { useEffect } from 'react'
import {
  claimSessionUnmount,
  markSessionMounted,
} from '@/helpers/sessionCleanupGuard'

export function useBeaconCleanup(sessionId: string | null) {
  useEffect(() => {
    if (!sessionId) return

    const mountGeneration = markSessionMounted(sessionId)
    let expirySent = false

    const expireSession = () => {
      if (expirySent) return
      expirySent = true
      navigator.sendBeacon(
        '/api/session/expire',
        new Blob([JSON.stringify({ sessionId })], { type: 'application/json' })
      )
    }

    const handleVisibilityChange = () => {
      // Intentional anti-cheat behavior: hiding the exam tab ends the session.
      if (document.hidden) {
        expireSession()
      }
    }

    const handlePageHide = () => {
      expireSession()
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('pagehide', handlePageHide)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('pagehide', handlePageHide)

      // React Strict Mode and Fast Refresh immediately remount the same session.
      // Delay unmount expiry by one task so that remount can invalidate this generation.
      window.setTimeout(() => {
        if (claimSessionUnmount(sessionId, mountGeneration)) {
          expireSession()
        }
      }, 0)
    }
  }, [sessionId])
}
