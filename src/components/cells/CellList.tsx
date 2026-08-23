"use client"

import { Fragment, useEffect } from 'react'
import AddCell from './AddCell'
import CellListItem from './CellListItem'
import { useCellsStore } from '@/store/useCellsStore'
import { useRagStore } from '@/store/useRagStore'
import { buildRagCellContent } from '@/helpers/buildRagCellContent'
import type { CellsSnapshot } from '@/helpers/cellsConcurrency'
import CellsConflictBanner from './CellsConflictBanner'

export default function CellList({
  isPremium = false,
  initialCells,
}: {
  isPremium?: boolean
  initialCells: CellsSnapshot | null
}) {
  const {
    data,
    order,
    insertCellAfter,
    updateCell,
    hasHydrated,
    initialized,
    initializeFromServer,
  } = useCellsStore()
  const { pendingTopic, consumePendingTopic, setPendingAutoSubmitCellId } = useRagStore()

  useEffect(() => {
    if (hasHydrated && !initialized) initializeFromServer(initialCells)
  }, [hasHydrated, initialized, initialCells, initializeFromServer])

  useEffect(() => {
    if (initialized && pendingTopic) {
      const topic = consumePendingTopic()
      if (!topic) return
      insertCellAfter(null, 'rag')

      const newCellId = useCellsStore.getState().order[0]

      if (newCellId) {
        updateCell(newCellId, buildRagCellContent(topic))
        setPendingAutoSubmitCellId(newCellId)
      }
    }
  }, [
    initialized,
    pendingTopic,
    insertCellAfter,
    updateCell,
    consumePendingTopic,
    setPendingAutoSubmitCellId,
  ])

  if (!initialized) return null

  return (
    <div className="w-full">
      <CellsConflictBanner />
      <AddCell prevCellId={null} forceVisible={order.length === 0} isPremium={isPremium} />
      {order.map((cell) => (
        <Fragment key={cell}>
          <CellListItem cell={data[cell]!} isPremium={isPremium} />
          <AddCell prevCellId={cell} isPremium={isPremium} />
        </Fragment>
      ))}
    </div>
  )
}
