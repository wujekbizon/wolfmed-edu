'use server'

import { auth } from '@clerk/nextjs/server'
import { checkRateLimit } from '@/lib/rateLimit'
import { persistPracticeProgress } from '@/server/savePracticeProgress'

export async function savePracticeProgressAction(input: unknown) {
  const { userId } = await auth()
  if (!userId) return { success: false as const, message: 'Zaloguj się ponownie.' }
  const limit = await checkRateLimit(userId, 'test:practice:save')
  if (!limit.success) return { success: false as const, message: 'Zbyt wiele zapisów. Spróbuj ponownie.' }
  return persistPracticeProgress(userId, input)
}
