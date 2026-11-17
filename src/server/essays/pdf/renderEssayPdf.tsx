import 'server-only'
import path from 'node:path'
import { Font, renderToBuffer } from '@react-pdf/renderer'
import { parseLexicalContent } from '@/helpers/safeJsonParse'
import { validateEssayNode } from '@/helpers/validateEssayNode'
import { ESSAY_PDF_BYTES } from '@/constants/essay'
import type { SourceRef } from '@/types/retrievalTypes'
import EssayDocument from './EssayDocument'

Font.register({ family: 'EssayNoto', fonts: [
  { src: path.join(process.cwd(), 'public/fonts/stripe-report/NotoSans-Regular.ttf'), fontWeight: 400 },
  { src: path.join(process.cwd(), 'public/fonts/stripe-report/NotoSans-Bold.ttf'), fontWeight: 700 },
  { src: path.join(process.cwd(), 'public/fonts/essay/NotoSans-Italic.ttf'), fontWeight: 400, fontStyle: 'italic' },
  { src: path.join(process.cwd(), 'public/fonts/essay/NotoSans-BoldItalic.ttf'), fontWeight: 700, fontStyle: 'italic' },
] })

export async function renderEssayPdf(topic: string, editorContent: string, sources: SourceRef[]) {
  const parsed = parseLexicalContent(editorContent)
  if (!parsed.success) throw new Error('Nie udało się odczytać treści pracy.')
  const root = validateEssayNode((parsed.content as { root: unknown }).root)
  if (root.type !== 'root') throw new Error('Nieprawidłowa struktura pracy.')
  const buffer = await renderToBuffer(<EssayDocument topic={topic} root={root} sources={sources} />)
  if (buffer.length > ESSAY_PDF_BYTES) throw new Error('PDF jest zbyt duży. Skróć treść pracy.')
  return buffer.toString('base64')
}
