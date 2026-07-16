'use client'

import { Maximize2, Minimize2 } from 'lucide-react'
import { useCellsStore } from '@/store/useCellsStore'
import type { Cell } from '@/types/cellTypes'
import DeleteIcon from '../icons/DeleteIcon'
import ActionButton from './ActionButton'
import ArrowUpIcon from '../icons/ArrowUpIcon'
import ArrowDownIcon from '../icons/ArrowDownIcon'
import SaveCellsButton from './SaveCellsButton'
import { SyncCellsButton } from './SyncCellsButton'

interface ActionBarProps {
    cell: Cell
    isFullscreen: boolean
    onToggleFullscreen: () => void
}

export default function ActionBar({ cell, isFullscreen, onToggleFullscreen }: ActionBarProps) {
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
                <ActionButton
                    icon={isFullscreen ? <Minimize2 size={16} color="white" /> : <Maximize2 size={16} color="white" />}
                    onClick={onToggleFullscreen}
                />
                <ActionButton icon={<DeleteIcon  color="#f56868" />} onClick={() => deleteCell(cell.id)} />
            </div>
        </div>
    )
}
