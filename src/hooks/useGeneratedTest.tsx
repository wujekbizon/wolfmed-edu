import { useState, useEffect } from 'react'
import { Test } from '@/types/dataTypes'
import { generateRandomTests } from '@/helpers/generatedRandomTests'

/**
 * Randomly selects a subset of tests from the provided pool and keeps the
 * selection in sync whenever the pool or requested count changes.
 * Resets to an empty array when `numberTests` is null or 0.
 *
 * @param tests Full pool of available tests to draw from
 * @param numberTests How many tests to generate, or null to produce none
 * @returns Array of randomly selected test objects
 */
export function useGeneratedTest(tests: Test[], numberTests: number | null) {
  const [randomTestsArray, setRandomTestsArray] = useState<Test[]>([])

  useEffect(() => {
    if (!numberTests) {
      setRandomTestsArray([])
      return
    }
    setRandomTestsArray(generateRandomTests(tests, numberTests))
  }, [numberTests, tests])

  return randomTestsArray
}
