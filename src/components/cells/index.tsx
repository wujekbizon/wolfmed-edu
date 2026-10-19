import dynamic from 'next/dynamic'
import CellEditorSkeleton from '@/components/skeletons/CellEditorSkeleton'

const DynamicExcalidraw = dynamic(() => import('@/components/excalidraw/Excalidraw'), {
  loading: CellEditorSkeleton,
  ssr: false,
})

const DynamicTextEditor = dynamic(() => import('./NoteCell'), {
  loading: CellEditorSkeleton,
  ssr: false,
})

const DynamicNoteCell = dynamic(() => import('./NoteCell'), {
  loading: CellEditorSkeleton,
  ssr: false,
})

const DynamicRagCell = dynamic(() => import('./RagCell'), {
  loading: CellEditorSkeleton,
  ssr: false,
})

const DynamicTestCell = dynamic(() => import('./TestCell'), {
  loading: CellEditorSkeleton,
  ssr: false,
})

const DynamicFlashcardCell = dynamic(() => import('./FlashcardCell'), {
  loading: CellEditorSkeleton,
  ssr: false,
})

const DynamicPlanCell = dynamic(() => import('./PlanCell'), {
  loading: CellEditorSkeleton,
  ssr: false,
})

const DynamicMediaCell = dynamic(() => import('./MediaCell'), {
  loading: CellEditorSkeleton,
  ssr: false,
})

const DynamicMindMapCell = dynamic(() => import('./MindMapCell'), {
  loading: CellEditorSkeleton,
  ssr: false,
})

export { DynamicExcalidraw, DynamicTextEditor, DynamicNoteCell, DynamicRagCell, DynamicTestCell, DynamicFlashcardCell, DynamicPlanCell, DynamicMediaCell, DynamicMindMapCell }
