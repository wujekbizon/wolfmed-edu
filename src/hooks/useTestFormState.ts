import { useCallback, useEffect, useState } from 'react'
import { EMPTY_FORM_STATE } from '@/constants/formState'
import { useGenerateTestStore } from '@/store/useGenerateTestStore'
import { FormState } from '@/types/actionTypes'

// Custom hook to manage the test form state and resetting logic
export function useTestFormState(state: FormState) {
  // Access global state (number of tests, whether a test is active) from the store
  const { numberTests, isTest, setNumberTests, setIsTest } = useGenerateTestStore()
  // Local state to manage form submission state (e.g., success, error, etc.)
  const [localState, setLocalState] = useState(EMPTY_FORM_STATE)

  // Sync the localState with the incoming form state from the action
  useEffect(() => {
    setLocalState(state)
  }, [state])

  // Function to reset the test state and form data to the initial values
  const resetTest = useCallback(() => {
    setNumberTests(null) // Clear the number of tests
    setIsTest(false) // Mark that no test is currently active
    setLocalState(EMPTY_FORM_STATE) // Reset form state to the initial empty state
  }, [setNumberTests, setIsTest])

  // Automatically reset the test when the form submission is successful
  useEffect(() => {
    if (localState.status === 'SUCCESS') {
      resetTest()
    }
  }, [localState.status, resetTest])

  // Return relevant state and functions needed for managing the test form
  return { numberTests, isTest, localState, resetTest }
}
