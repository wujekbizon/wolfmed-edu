import 'server-only'
import { and, eq, inArray } from 'drizzle-orm'
import { db } from '@/server/db/index'
import { materials, notes } from '@/server/db/schema'
import { getLexicalContent } from '@/helpers/getLexicalContent'
import type { ContextChunk, RetrievedContext } from '@/types/retrievalTypes'

/**
 * Loads whole notes and materials the student attached by name.
 *
 * Whole, not retrieved: „@skrypt /podsumuj" has to summarise the document, and
 * chunk retrieval would hand it whichever passages matched the query instead.
 * The student already did the selecting — that is what an attachment is.
 *
 * A material with no extracted text yields nothing here; the caller falls back
 * to shipping the file, as it did before extraction existed.
 */
export async function getAttachedSourceText(
  userId: string,
  sourceIds: string[]
): Promise<RetrievedContext> {
  if (sourceIds.length === 0) return { chunks: [], sources: [], hasCanonical: false }

  const [attachedNotes, attachedMaterials] = await Promise.all([
    db
      .select({ id: notes.id, title: notes.title, content: notes.content })
      .from(notes)
      .where(and(eq(notes.userId, userId), inArray(notes.id, sourceIds))),
    db
      .select({ id: materials.id, title: materials.title, text: materials.extractedText })
      .from(materials)
      .where(and(eq(materials.userId, userId), inArray(materials.id, sourceIds))),
  ])

  const chunks: ContextChunk[] = [
    ...attachedNotes.map((note) => ({
      text: getLexicalContent(
        typeof note.content === 'string' ? note.content : JSON.stringify(note.content)
      ),
      origin: 'note' as const,
      label: note.title,
    })),
    ...attachedMaterials
      .filter((material) => Boolean(material.text))
      .map((material) => ({
        text: material.text!,
        origin: 'material' as const,
        label: material.title,
      })),
  ].filter((chunk) => chunk.text.trim().length > 0)

  return {
    chunks,
    sources: chunks.map(({ label, origin }) => ({ label, origin })),
    // The corpus was deliberately not consulted. Not a failure — the student
    // chose this source, so the caller must not treat it as a missing curriculum.
    hasCanonical: true,
  }
}
