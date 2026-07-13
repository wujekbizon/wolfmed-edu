import 'server-only'
import { db } from './db/index'
import { ragConfig } from './db/schema'
import { eq } from 'drizzle-orm'

type RagConfigRow = typeof ragConfig.$inferSelect

/**
 * Get the current RAG configuration
 * Returns the first/active file search store configuration
 */
export async function getRagConfig(): Promise<RagConfigRow | null> {
  const [config] = await db
    .select()
    .from(ragConfig)
    .orderBy(ragConfig.createdAt)
    .limit(1)

  return config || null
}

/**
 * Save or update RAG configuration.
 * Upserts the store name, display name, and (optionally) what the corpus is
 * actually running on — deployment mode, embedding model, and corpus id.
 */
export async function setRagConfig(
  storeName: string,
  storeDisplayName?: string,
  meta?: {
    deploymentMode?: string
    embeddingModel?: string
  }
): Promise<void> {
  // corpusId is the trailing segment of the corpus resource name.
  const corpusId = storeName.split('/ragCorpora/')[1] ?? null

  await db.delete(ragConfig)
  await db.insert(ragConfig).values({
    storeName,
    storeDisplayName: storeDisplayName || null,
    deploymentMode: meta?.deploymentMode ?? null,
    embeddingModel: meta?.embeddingModel ?? null,
    corpusId,
    updatedAt: new Date(),
  })
}

/**
 * Delete RAG configuration by store name
 * Removes the store configuration from database
 */
export async function deleteRagConfig(storeName: string): Promise<void> {
  await db.delete(ragConfig).where(eq(ragConfig.storeName, storeName))
}
