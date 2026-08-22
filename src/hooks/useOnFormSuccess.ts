import { useEffect, useRef } from 'react'
import type { FormState } from '@/types/actionTypes'

/**
 * Runs a callback once per successful server action result.
 *
 * Dedupes on `state.timestamp` for the same reason `useToastMessage` does — the form
 * state object survives unrelated re-renders, which would otherwise re-fire the callback.
 */
export function useOnFormSuccess(state: FormState, onSuccess: () => void) {
  const lastHandled = useRef(state.timestamp)
  const callbackRef = useRef(onSuccess)
  callbackRef.current = onSuccess

  useEffect(() => {
    if (state.status !== 'SUCCESS' || state.timestamp === lastHandled.current) return
    lastHandled.current = state.timestamp
    callbackRef.current()
  }, [state.status, state.timestamp])
}
