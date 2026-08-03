import MaterialsSection from './MaterialsSection'
import { getMaterialsByUser } from '@/server/queries'
import { getIsPremium } from '@/server/premium'
import type { MaterialsType } from '@/types/materialsTypes'

export default async function NaukaMaterialsSection({ userId }: { userId: string }) {
  const [materials, isPremium] = await Promise.all([
    getMaterialsByUser(userId) as Promise<MaterialsType[]>,
    getIsPremium(),
  ])

  return <MaterialsSection materials={materials} isPremium={isPremium} />
}
