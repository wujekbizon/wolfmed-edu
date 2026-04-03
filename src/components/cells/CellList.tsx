"use client"

import { Fragment, useEffect } from 'react'
import AddCell from './AddCell'
import CellListItem from './CellListItem'
import { useCellsStore } from '@/store/useCellsStore'
import { useRagStore } from '@/store/useRagStore'

export default function CellList({ isPremium = false }: { isPremium?: boolean }) {
  const { data, order, insertCellAfter, updateCell } = useCellsStore()
  const { pendingTopic, setPendingTopic, setPendingAutoSubmitCellId } = useRagStore()

  useEffect(() => {
    if (pendingTopic) {
      insertCellAfter(null, 'rag')

      const newCellId = useCellsStore.getState().order[0]

      if (newCellId) {
        updateCell(newCellId, pendingTopic)
        setPendingAutoSubmitCellId(newCellId)
      }

      setPendingTopic(null)
    }
  }, [pendingTopic, insertCellAfter, updateCell, setPendingTopic, setPendingAutoSubmitCellId])

  return (
    <div className="w-full">
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
