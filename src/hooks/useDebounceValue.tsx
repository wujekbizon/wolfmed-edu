import { useState, useEffect } from 'react'

/**
 * Custom hook to implement debounced value behavior in React components.
 *
 * Debounced value refers to a value that is only updated in the component's state
 * after a certain amount of time has passed since the last update. This is useful
 * for scenarios where you want to avoid frequent state updates based on rapidly
 * changing values (e.g., user input).
 *
 * @param {T} value - The value to be debounced.
 * @param {number} delay - The delay (in milliseconds) before updating the debounced value.
 * @returns {T} - The current debounced value.
 */

export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value) // State variable for debounced value
  const [prevValue, setPrevValue] = useState<T>(value) // State variable to track previous value

  useEffect(() => {
    // Skip update if value hasn't changed
    if (value === prevValue) {
      return
    }

    const timer = setTimeout(() => {
      // Update debounced value and previous value after delay
      setDebouncedValue(value)
      setPrevValue(value)
    }, delay)

    return () => {
      // Cleanup function to clear timer on unmount or value/delay change
      clearTimeout(timer)
    }
  }, [value, delay, prevValue]) // Re-run on changes to value or delay

  // Return the current debounced value
  return debouncedValue
}
