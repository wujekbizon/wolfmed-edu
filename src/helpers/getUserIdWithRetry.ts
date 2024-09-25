import { getUserIdByCustomer } from '@/server/queries'

export async function getUserIdWithRetry(customerId: string, retries = 3, delayMs = 1000): Promise<string | null> {
  for (let i = 0; i < retries; i++) {
    const userId = await getUserIdByCustomer(customerId)
    if (userId) return userId

    console.log(`Retrying to find userId for customer: ${customerId}... (${i + 1}/${retries})`)
    await new Promise((resolve) => setTimeout(resolve, delayMs)) // Wait before retrying
  }
  return null
}
