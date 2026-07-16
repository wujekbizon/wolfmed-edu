import {
  DynamicExcalidraw,
  DynamicNoteCell,
  DynamicRagCell,
  DynamicTestCell,
  DynamicFlashcardCell,
  DynamicPlanCell,
  DynamicMediaCell,
  DynamicMindMapCell,
} from '.'
import type { Cell } from '@/types/cellTypes'

export default function CellContent({ cell, isPremium }: { cell: Cell; isPremium: boolean }) {
  switch (cell.type) {
    case 'note':
      return <DynamicNoteCell cell={cell} />
    case 'rag':
      return <DynamicRagCell cell={cell} isPremium={isPremium} />
    case 'draw':
      return <DynamicExcalidraw cell={cell} />
    case 'test':
      return <DynamicTestCell cell={cell} />
    case 'flashcard':
      return <DynamicFlashcardCell cell={cell} />
    case 'plan':
      return <DynamicPlanCell cell={cell} />
    case 'media':
      return <DynamicMediaCell cell={cell} />
    case 'mindmap':
      return <DynamicMindMapCell cell={cell} />
    default:
      return null
  }
}
