'use client'

import { useCellsStore } from '@/store/useCellsStore'
import type { Cell } from '@/types/cellTypes'
import DeleteIcon from '../icons/DeleteIcon'
import ActionButton from './ActionButton'
import ArrowUpIcon from '../icons/ArrowUpIcon'
import ArrowDownIcon from '../icons/ArrowDownIcon'
import SaveCellsButton from './SaveCellsButton'
import { SyncCellsButton } from './SyncCellsButton'


export default function ActionBar({ cell }: { cell: Cell }) {
    const { moveCell, deleteCell } = useCellsStore()

    return (
        <div className='flex items-center justify-between'>
            <div className="flex items-center px-1 gap-1">
                <SaveCellsButton />
                <SyncCellsButton />
            </div>
            <div className="flex items-center px-1 gap-1">
                <ActionButton
                    icon={<ArrowUpIcon color="white"/>}
                    onClick={() =>
                        moveCell(cell.id, "up")
                    }
                />
                <ActionButton
                    icon={<ArrowDownIcon color='white' />}
                    onClick={() =>
                        moveCell(cell.id, 'down')
                    }
                />
                <ActionButton icon={<DeleteIcon  color="#f56868" />} onClick={() => deleteCell(cell.id)} />
            </div>
        </div>
    )
}
