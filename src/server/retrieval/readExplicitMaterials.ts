import 'server-only'
import { and, eq, inArray } from 'drizzle-orm'
import { db } from '@/server/db'
import { materials } from '@/server/db/schema'
import type { ContextChunk } from '@/types/retrievalTypes'

export async function readExplicitMaterials(userId: string, ids: string[]): Promise<ContextChunk[]> {
  const uniqueIds = [...new Set(ids)]
  if (!uniqueIds.length) return []
  const rows = await db.select({ id: materials.id, title: materials.title, type: materials.type, text: materials.extractedText })
    .from(materials).where(and(eq(materials.userId, userId), inArray(materials.id, uniqueIds)))
  if (rows.length !== uniqueIds.length) throw new Error('Wybrany materiał został usunięty lub jest niedostępny.')
  return uniqueIds.map((id) => {
    const row = rows.find((material) => material.id === id)!
    if (!['application/pdf', 'text/plain'].includes(row.type)) throw new Error('Wybierz plik PDF lub TXT.')
    if (!row.text?.trim()) throw new Error(`Materiał „${row.title}” nie jest jeszcze przygotowany do użycia.`)
    return { text: row.text, label: row.title, origin: 'material' as const }
  })
}
