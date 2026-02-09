export async function getUserIdWithRetry(
  lookupFn: (param: string) => Promise<string | null>,
  param: string,
  retries = 3,
  delayMs = 1000
): Promise<string | null> {
  for (let i = 0; i < retries; i++) {
    const userId = await lookupFn(param)
    if (userId) return userId

    await new Promise((resolve) => setTimeout(resolve, delayMs))
  }
  return null
}
