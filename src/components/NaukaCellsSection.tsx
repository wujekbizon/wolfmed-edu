import CellList from './cells/CellList'
import { getIsPremium } from '@/server/premium'

export default async function NaukaCellsSection() {
  const isPremium = await getIsPremium()

  return <CellList isPremium={isPremium} />
}
