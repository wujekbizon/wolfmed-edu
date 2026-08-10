import CellList from './cells/CellList'
import { getIsPremium } from '@/server/premium'
import { auth } from '@clerk/nextjs/server'
import { getUserCellsList } from '@/server/queries'

export default async function NaukaCellsSection() {
  const [{ userId }, isPremium] = await Promise.all([auth(), getIsPremium()])
  const savedCells = userId ? await getUserCellsList(userId) : null
  const initialCells = savedCells
    ? {
        order: savedCells.order,
        cells: savedCells.cells,
        version: savedCells.version,
      }
    : null

  return <CellList isPremium={isPremium} initialCells={initialCells} />
}
