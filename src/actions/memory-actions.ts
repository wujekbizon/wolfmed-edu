'use server'

import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'
import { fromErrorToFormState, toFormState } from '@/helpers/toFormState'
import { FormState } from '@/types/actionTypes'
import { checkRateLimit } from '@/lib/rateLimit'
import { PREFERENCE_DEFS } from '@/constants/memoryPreferences'
import { upsertPreferences, getPreferencesMap } from '@/server/memory/stores/preferences'

// Saves the student's learning preferences (Path A memory). Values are validated
// against the allowed options in PREFERENCE_DEFS so the store never holds junk.
export async function updatePreferencesAction(
  formState: FormState,
  formData: FormData
): Promise<FormState> {
  try {
    const { userId } = await auth()
    if (!userId) throw new Error('Unauthorized')

    const rateLimit = await checkRateLimit(userId, 'profile:update:preferences')
    if (!rateLimit.success) {
      const resetMinutes = Math.ceil((rateLimit.reset - Date.now()) / 60000)
      return toFormState('ERROR', `Zbyt wiele zmian. Spróbuj ponownie za ${resetMinutes} minut.`)
    }

    const entries: Array<{ key: string; value: string; source: 'user_stated' }> = []
    const values: Record<string, string> = {}

    for (const def of PREFERENCE_DEFS) {
      const raw = formData.get(def.key)
      if (typeof raw !== 'string' || raw === '') continue
      if (!def.options.some((o) => o.value === raw)) {
        return toFormState('ERROR', `Nieprawidłowa wartość dla: ${def.label}`)
      }
      entries.push({ key: def.key, value: raw, source: 'user_stated' })
      values[def.key] = raw
    }

    if (entries.length > 0) {
      await upsertPreferences(userId, entries)
    }

    revalidatePath('/panel/ustawienia')

    return { ...toFormState('SUCCESS', 'Preferencje zapisane'), values }
  } catch (error) {
    console.error('Error updating preferences:', error)
    return fromErrorToFormState(error)
  }
}

// Reads the student's stored preferences as a flat string map for UI hydration.
// Fail-safe: returns {} if memory is unavailable (e.g. tables not migrated yet).
export async function getUserPreferencesAction(): Promise<Record<string, string>> {
  try {
    const { userId } = await auth()
    if (!userId) return {}

    const map = await getPreferencesMap(userId)
    const out: Record<string, string> = {}
    for (const [key, value] of Object.entries(map)) {
      out[key] = typeof value === 'string' ? value : String(value ?? '')
    }
    return out
  } catch (error) {
    console.error('Error reading preferences:', error)
    return {}
  }
}
