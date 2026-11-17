'use server'

import { after } from 'next/server'
import { and, eq, inArray } from 'drizzle-orm'
import { db } from '@/server/db'
import { materials } from '@/server/db/schema'
import { EssayMaterialPreparationSchema } from '@/server/schema'
import { requireEssayAccess } from '@/server/essays/requireEssayAccess'
import { syncMaterialChunks } from '@/server/library/sync-material'
import { fromErrorToFormState, toFormState } from '@/helpers/toFormState'
import type { FormState } from '@/types/actionTypes'

export async function prepareEssayMaterialAction(_state: FormState, data: FormData): Promise<FormState> {
  try {
    await requireEssayAccess()
    const input = EssayMaterialPreparationSchema.parse({ materialId: data.get('materialId'), course: data.get('course') })
    const userId = await requireEssayAccess(input.course, 'material:prepare')
    const [material] = await db.select({ id: materials.id }).from(materials).where(and(
      eq(materials.id, input.materialId), eq(materials.userId, userId), inArray(materials.type, ['application/pdf', 'text/plain']),
    ))
    if (!material) throw new Error('Materiał jest niedostępny.')
    await db.update(materials).set({ indexStatus: 'pending', indexedAt: null })
      .where(and(eq(materials.id, material.id), eq(materials.userId, userId), inArray(materials.indexStatus, ['not_indexed', 'unindexable'])))
    after(() => syncMaterialChunks(userId, material.id))
    return toFormState('SUCCESS', 'Przygotowujemy materiał. Stan zaktualizuje się automatycznie.')
  } catch (error) {
    return fromErrorToFormState(error)
  }
}
