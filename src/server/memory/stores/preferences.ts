import 'server-only'
import { eq } from 'drizzle-orm'
import { db } from '@/server/db/index'
import { memPreferences, type MemPreference } from '@/server/db/memory-schema'

export type PreferenceSource = 'user_stated' | 'llm_inferred' | 'admin_set'

export async function getPreferences(userId: string): Promise<MemPreference[]> {
  return db.select().from(memPreferences).where(eq(memPreferences.userId, userId))
}

// Convenience map (pref_key → stored value) for the assembler and UI hydration.
export async function getPreferencesMap(userId: string): Promise<Record<string, unknown>> {
  const rows = await getPreferences(userId)
  return Object.fromEntries(rows.map((r) => [r.prefKey, r.prefValue]))
}

export async function upsertPreference(
  userId: string,
  prefKey: string,
  prefValue: unknown,
  source: PreferenceSource = 'user_stated',
  confidence?: number
): Promise<void> {
  await db
    .insert(memPreferences)
    .values({
      userId,
      prefKey,
      prefValue,
      source,
      confidence: confidence ?? null,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [memPreferences.userId, memPreferences.prefKey],
      set: {
        prefValue,
        source,
        confidence: confidence ?? null,
        updatedAt: new Date(),
      },
    })
}

export async function upsertPreferences(
  userId: string,
  entries: Array<{ key: string; value: unknown; source?: PreferenceSource; confidence?: number }>
): Promise<void> {
  for (const entry of entries) {
    await upsertPreference(userId, entry.key, entry.value, entry.source, entry.confidence)
  }
}
