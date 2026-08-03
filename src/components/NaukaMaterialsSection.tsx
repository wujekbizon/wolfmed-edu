import MaterialsSection from './MaterialsSection'
import { getMaterialsByUser } from '@/server/queries'
import type { MaterialsType } from '@/types/materialsTypes'

export default async function NaukaMaterialsSection({ userId }: { userId: string }) {
  const materials = (await getMaterialsByUser(userId)) as MaterialsType[]

  return <MaterialsSection materials={materials} />
}
