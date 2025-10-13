import { Fragment } from 'react'
import AddCell from './AddCell'
import CellListItem from './CellListItem'
import { useCellsStore } from '@/store/useCellsStore';
import { UserCellsList } from '@/types/cellTypes';

export default function CellList({cells}:{cells: UserCellsList}) {
  const {data, order, setCells} = useCellsStore();
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