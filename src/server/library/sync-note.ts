import 'server-only'
import { getLexicalContent } from '@/helpers/getLexicalContent'
import { indexSource, removeSourceChunks } from './index-source'

interface SyncNoteInput {
  userId: string
  noteId: string
  title: string
  // Lexical editor state. notes.content is jsonb, so this arrives as an object
  // from the database and as a JSON string from a freshly parsed form payload.
  content: unknown
}

/**
 * Keeps a note's library chunks in step with its text.
 *
 * Text comes from the stored Lexical JSON, never from `notes.plain_text` — that
 * column is filled by a hidden input the browser sends and is nullable, so it is
 * neither trustworthy nor reliably present.
 *
 * Never throws. Chunks are derived data; failing to index must not fail the save
 * that produced them, and the next edit re-indexes anyway.
 */
export async function syncNoteChunks({
  userId,
  noteId,
  title,
  content,
}: SyncNoteInput): Promise<void> {
  try {
    const text = getLexicalContent(
      typeof content === 'string' ? content : JSON.stringify(content)
    )

    await indexSource({
      userId,
      sourceType: 'note',
      sourceId: noteId,
      title,
      text,
    })
  } catch (error) {
    console.error('[library] Failed to index note', noteId, error)
  }
}

export async function removeNoteChunks(userId: string, noteId: string): Promise<void> {
  try {
    await removeSourceChunks(userId, noteId)
  } catch (error) {
    console.error('[library] Failed to remove note chunks', noteId, error)
  }
}
