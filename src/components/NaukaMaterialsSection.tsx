import MaterialsSection from './MaterialsSection'
import { getMaterialsByUser } from '@/server/queries'
import { getMergedMaterials } from '@/helpers/mergeMaterials'
import type { MaterialsType } from '@/types/materialsTypes'

export default async function NaukaMaterialsSection({ userId }: { userId: string }) {
  const userMaterials = (await getMaterialsByUser(userId)) as MaterialsType[]
  const materials = await getMergedMaterials(userMaterials)

  return <MaterialsSection materials={materials} />
}
