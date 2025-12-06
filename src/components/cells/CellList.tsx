"use client"

import { Fragment } from 'react'
import AddCell from './AddCell'
import CellListItem from './CellListItem'
import { useCellsStore } from '@/store/useCellsStore';

export default function CellList() {
  const {data, order} = useCellsStore();
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