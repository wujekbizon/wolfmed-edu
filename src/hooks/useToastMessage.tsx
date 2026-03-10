import { useRef, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { FormState } from '@/types/actionTypes'

/**
 * Displays a `react-hot-toast` notification whenever a server action produces a new result.
 *
 * Deduplication is handled via `formState.timestamp` — a toast is only shown when the
 * timestamp changes relative to the previous render, preventing repeat toasts on
 * unrelated re-renders.
 *
 * Also returns a `<noscript>` fallback so the status message remains visible in
 * environments where JavaScript is disabled.
 *
 * @param formState - The `FormState` object returned by a server action. A new toast is
 *   triggered each time `timestamp` changes and `message` is non-empty.
 *   - `status === 'ERROR'` → `toast.error`
 *   - anything else → `toast.success`
 *
 * @returns A `<noscript>` element containing an inline status message styled in red
 *   (error) or green (success).
 *
 * @example
 * ```tsx
 * const [formState, action] = useActionState(createPost, initialFormState)
 * const noscriptFallback = useToastMessage(formState)
 * return <form action={action}>{noscriptFallback}...</form>
 * ```
 */
const useToastMessage = (formState: FormState) => {
  const prevTimestamp = useRef(formState.timestamp)
  const showToast = formState.message && formState.timestamp !== prevTimestamp.current

  useEffect(() => {
    if (showToast) {
      if (formState.status === 'ERROR') {
        toast.error(formState.message)
      } else {
        toast.success(formState.message)
      }

      prevTimestamp.current = formState.timestamp
    }
  }, [formState, showToast])

  // stay usable without JS
  return (
    <noscript>
      {formState.status === 'ERROR' && <div style={{ color: 'red' }}>{formState.message}</div>}

      {formState.status === 'SUCCESS' && <div style={{ color: 'green' }}>{formState.message}</div>}
    </noscript>
  )
}

/**
 * Imperative helper for firing a toast outside of a React component — e.g. in event
 * handlers, utilities, or server action callbacks that run outside the hook lifecycle.
 *
 * @param status - `'ERROR'` shows `toast.error`, `'SUCCESS'` shows `toast.success`.
 * @param message - The text displayed inside the toast.
 */
export const showToast = (status: 'SUCCESS' | 'ERROR', message: string) => {
  if (status === 'ERROR') toast.error(message)
  else toast.success(message)
}

export { useToastMessage }
