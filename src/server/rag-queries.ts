import 'server-only'
import { db } from './db/index'
import { ragConfig } from './db/schema'
import { eq } from 'drizzle-orm'

/**
 * Get the current RAG configuration
 * Returns the file search store configuration
 */
export async function getRagConfig(): Promise<{
  id: string
  storeName: string
  storeDisplayName: string | null
  createdAt: Date
  updatedAt: Date
} | null> {
  const [config] = await db
    .select()
    .from(ragConfig)
    .where(eq(ragConfig.id, 'default'))
    .limit(1)

  return config || null
}

/**
 * Save or update RAG configuration
 * Upserts the store name and display name
 */
export async function setRagConfig(
  storeName: string,
  storeDisplayName?: string
): Promise<void> {
  await db
    .insert(ragConfig)
    .values({
      id: 'default',
      storeName,
      storeDisplayName: storeDisplayName || null,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: ragConfig.id,
      set: {
        storeName,
        storeDisplayName: storeDisplayName || null,
        updatedAt: new Date(),
      },
    })
}

/**
 * Delete RAG configuration
 * Removes the store configuration from database
 */
export async function deleteRagConfig(): Promise<void> {
  await db.delete(ragConfig).where(eq(ragConfig.id, 'default'))
}
