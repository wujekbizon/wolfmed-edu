"use client"

import { Fragment, useEffect } from 'react'
import AddCell from './AddCell'
import CellListItem from './CellListItem'
import { useCellsStore } from '@/store/useCellsStore'
import { useRagStore } from '@/store/useRagStore'

export default function CellList() {
  const { data, order, insertCellAfter, updateCell } = useCellsStore()
  const { pendingTopic, setPendingTopic } = useRagStore()

  useEffect(() => {
    if (pendingTopic) {
      // Insert new RAG cell at the top
      insertCellAfter(null, 'rag')

      // Get the newly created cell id (it will be first in order)
      const newCellId = useCellsStore.getState().order[0]

      if (newCellId) {
        // Update the cell content with the pending topic
        updateCell(newCellId, pendingTopic)
      }

      // Clear the pending topic
      setPendingTopic(null)
    }
  }, [pendingTopic, insertCellAfter, updateCell, setPendingTopic])

  return (
    <div className="w-full">
      <AddCell prevCellId={null} forceVisible={order.length === 0} />
      {order.map((cell) => (
        <Fragment key={cell}>
          <CellListItem cell={data[cell]!} />
          <AddCell prevCellId={cell} />
        </Fragment>
      ))}
    </div>
  )
}