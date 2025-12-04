import { fileData } from "@/server/fetchData"
import { getUserCustomTests } from "@/server/queries"
import { Test } from "@/types/dataTypes"
import { UserCustomTest } from "@/server/db/schema"

/**
 * TEST MERGING ARCHITECTURE
 *
 * CURRENT IMPLEMENTATION:
 * - Official tests: data/tests.json (file system for performance)
 * - User custom tests: wolfmed_user_custom_tests table (database for dynamic content)
 * - This function merges both sources into unified Test[] array
 *
 * FUTURE CONSIDERATION:
 * In the future, we might migrate official tests to the database as well.
 * If that happens, this merge logic can be updated to:
 * - Query both tables (wolfmed_tests + wolfmed_user_custom_tests)
 * - Still use the same merge pattern
 * - Keep the API unchanged so no consumer code needs updates
 *
 * The separation between "official" and "user" tests should remain even if
 * both are database-backed for proper ownership, moderation, and filtering.
 */

/**
 * Merge official tests (JSON) with user's custom tests (DB)
 * @param userId - If provided and user is supporter, includes user tests
 * @returns Combined array of official + user tests
 */
export async function getMergedTests(userId?: string): Promise<Test[]> {
  // 1. Fetch official tests from JSON
  const officialTests = await fileData.getAllTests()

  // 2. If no userId, return only official tests
  if (!userId) return officialTests

  // 3. Fetch user's custom tests from DB
  const userTestsData = await getUserCustomTests(userId)

  // 4. Transform DB format to Test format
  const transformedUserTests: Test[] = userTestsData.map((ut: UserCustomTest) => ({
    id: ut.id,
    category: ut.category,
    data: ut.data as { question: string; answers: Array<{ option: string; isCorrect: boolean }> },
    createdAt: ut.createdAt,
    updatedAt: ut.updatedAt,
  }))

  // 5. Merge: official first, then user tests
  return [...officialTests, ...transformedUserTests]
}

/**
 * Get merged tests filtered by category
 */
export async function getMergedTestsByCategory(
  category: string,
  userId?: string
): Promise<Test[]> {
  const allTests = await getMergedTests(userId)
  return allTests.filter(test => test.category === category)
}

/**
 * Get unique categories from merged tests
 */
export async function getMergedCategories(userId?: string) {
  const allTests = await getMergedTests(userId)
  const uniqueCategories = [...new Set(allTests.map(t => t.category))]
  return uniqueCategories.map(cat => ({ category: cat }))
}

/**
 * Count tests in category from merged source
 */
export async function countMergedTestsByCategory(
  category: string,
  userId?: string
): Promise<number> {
  const tests = await getMergedTestsByCategory(category, userId)
  return tests.length
}
