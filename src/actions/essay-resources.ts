'use server'

import { getEssayResources } from '@/server/essays/getEssayResources'
import { requireEssayAccess } from '@/server/essays/requireEssayAccess'

export async function getEssayMaterialsAction() {
  const userId = await requireEssayAccess()
  const resources = await getEssayResources(userId)
  return resources.materials
}
