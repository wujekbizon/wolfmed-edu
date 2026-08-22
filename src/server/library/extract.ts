import 'server-only'
import { getGoogleAI } from '@/server/vertex-rag/client'
import {
  EXTRACTABLE_MIME_TYPES,
  EXTRACTION_MAX_OUTPUT_TOKENS,
  EXTRACTION_MODEL,
} from './config'

const EXTRACTION_PROMPT = `Przepisz CAŁY tekst z tego dokumentu.

ZASADY:
- Zachowaj kolejność i strukturę: nagłówki, akapity, listy, tabele wierszami.
- Przepisz również tekst ze skanów i obrazów, jeśli jest czytelny.
- Nie streszczaj, nie komentuj, nie dodawaj nic od siebie.
- Nie pisz wstępu ani podsumowania — zwróć wyłącznie treść dokumentu.
- Pomiń numery stron, nagłówki i stopki powtarzane na każdej stronie.`

export function isExtractable(mimeType: string): boolean {
  return (EXTRACTABLE_MIME_TYPES as readonly string[]).includes(mimeType)
}

/**
 * Reads a document's text with Gemini, once, at upload.
 *
 * Deliberately not a Node PDF library: the app already hands base64 PDFs to
 * Gemini and it reads them, so this is one call on a path already in
 * production. It also handles scanned skrypty, where a text-layer parser
 * returns nothing at all — the model reads the page as an image.
 */
export async function extractDocumentText(
  fileUrl: string,
  mimeType: string
): Promise<string> {
  const response = await fetch(fileUrl)
  if (!response.ok) {
    throw new Error(`Nie udało się pobrać pliku (${response.status})`)
  }

  const base64 = Buffer.from(await response.arrayBuffer()).toString('base64')
  const ai = getGoogleAI()

  const result = await ai.models.generateContent({
    model: EXTRACTION_MODEL,
    contents: [
      {
        role: 'user',
        parts: [{ inlineData: { data: base64, mimeType } }, { text: EXTRACTION_PROMPT }],
      },
    ],
    config: {
      maxOutputTokens: EXTRACTION_MAX_OUTPUT_TOKENS,
      // Transcription, not composition — nothing here benefits from sampling.
      temperature: 0,
      thinkingConfig: { thinkingBudget: 0 },
    },
  })

  return (result.text || '').trim()
}
