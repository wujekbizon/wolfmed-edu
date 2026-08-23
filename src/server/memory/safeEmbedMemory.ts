import 'server-only'
import { embedDocument } from '@/server/embeddings'

export async function safeEmbedMemory(text: string): Promise<number[] | null> {
  try {
    return await embedDocument(text)
  } catch {
    return null
  }
}
