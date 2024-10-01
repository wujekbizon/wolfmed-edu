export async function getUserIdWithRetry(
  lookupFn: (param: string) => Promise<string | null>,
  param: string,
  retries = 3,
  delayMs = 1000
): Promise<string | null> {
  for (let i = 0; i < retries; i++) {
    const userId = await lookupFn(param)
    if (userId) return userId

    console.log(`Retrying to find userId for ${param}... (${i + 1}/${retries})`)
    await new Promise((resolve) => setTimeout(resolve, delayMs)) // Wait before retrying
  }
  return null
}
