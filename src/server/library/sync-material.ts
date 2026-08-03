import 'server-only'
import { and, eq } from 'drizzle-orm'
import { db } from '@/server/db/index'
import { materials } from '@/server/db/schema'
import { extractDocumentText, isExtractable } from './extract'
import { indexSource, removeSourceChunks } from './index-source'
import { MIN_EXTRACTED_CHARS, type MaterialIndexStatus } from './config'

async function setStatus(
  materialId: string,
  indexStatus: MaterialIndexStatus,
  extractedText?: string
): Promise<void> {
  await db
    .update(materials)
    .set({
      indexStatus,
      indexedAt: new Date(),
      ...(extractedText === undefined ? {} : { extractedText }),
    })
    .where(eq(materials.id, materialId))
}

/**
 * Reads one uploaded material and files its text into the library.
 *
 * Runs after the upload response has been sent, so the student is not held
 * waiting on a model call. Never throws: a material that cannot be read is
 * marked and left alone, and the file itself is untouched either way — it stays
 * downloadable and viewable exactly as before.
 */
export async function syncMaterialChunks(userId: string, materialId: string): Promise<void> {
  try {
    const [material] = await db
      .select()
      .from(materials)
      .where(and(eq(materials.id, materialId), eq(materials.userId, userId)))
      .limit(1)

    if (!material) return

    // Video has no text layer and never will. Terminal, so the backstop skips it
    // rather than retrying a file that cannot succeed.
    if (!isExtractable(material.type)) {
      await setStatus(materialId, 'unindexable')
      return
    }

    const text = await extractDocumentText(material.url, material.type)

    if (text.length < MIN_EXTRACTED_CHARS) {
      // An image-only page the model could not read, or an empty document.
      // Recorded as failed rather than indexed, so it is visible instead of
      // silently present and empty.
      await setStatus(materialId, 'failed', '')
      return
    }

    await setStatus(materialId, 'indexed', text)

    await indexSource({
      userId,
      sourceType: 'material',
      sourceId: materialId,
      title: material.title,
      text,
    })
  } catch (error) {
    console.error('[library] Failed to index material', materialId, error)
    await setStatus(materialId, 'failed').catch(() => {})
  }
}

export async function removeMaterialChunks(userId: string, materialId: string): Promise<void> {
  try {
    await removeSourceChunks(userId, materialId)
  } catch (error) {
    console.error('[library] Failed to remove material chunks', materialId, error)
  }
}
