import { checkRateLimit } from '@/lib/rateLimit'
import { toFormState } from '@/helpers/toFormState'
import type { FormState } from '@/types/actionTypes'

export async function rateLimitFormState(
  userId: string,
  key: string
): Promise<FormState | null> {
  const rateLimit = await checkRateLimit(userId, key)
  if (rateLimit.success) return null

  const resetMinutes = Math.ceil((rateLimit.reset - Date.now()) / 60000)
  return toFormState(
    'ERROR',
    `Zbyt wiele żądań. Spróbuj ponownie za ${resetMinutes} minut.`
  )
}
