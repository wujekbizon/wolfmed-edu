import { useCallback, useTransition } from 'react'

// Custom hook to handle form submission with transition state
export function useTestSubmission(action: Function) {
  // Manage the transition state (pending or not) when handling async actions
  const [isPending, startTransition] = useTransition()

  // Handle form submission and trigger the provided action
  const handleSubmit = useCallback(
    (formData: FormData) => {
      // Use startTransition to manage a concurrent update and action execution
      startTransition(() => {
        action(formData) // Call the action (e.g., form submission) with the form data
      })
    },
    [action]
  )

  // Return the transition state and the submission handler
  return { isPending, handleSubmit }
}
