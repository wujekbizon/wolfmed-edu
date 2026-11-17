import CellList from './cells/CellList'
import { getIsPremium } from '@/server/premium'
import { auth } from '@clerk/nextjs/server'
import { getUserCellsList } from '@/server/queries'
import { getEssayResources } from '@/server/essays/getEssayResources'

export default async function NaukaCellsSection() {
  const [{ userId }, isPremium] = await Promise.all([auth(), getIsPremium()])
  if (!userId) return null
  const [savedCells, essayResources] = await Promise.all([getUserCellsList(userId), getEssayResources(userId)])
  const initialCells = savedCells
    ? {
        order: savedCells.order,
        cells: savedCells.cells,
        version: savedCells.version,
      }
    : null

  return <CellList isPremium={isPremium} initialCells={initialCells} essayResources={essayResources} />
}
