import dynamic from 'next/dynamic'
import ProgressBar from './ProgressBar'

const DynamicExcalidraw = dynamic(() => import('@/components/excalidraw/Excalidraw'), {
  loading: () => (
    <div className="h-1/10 flex flex-col items-center justify-center">
      <ProgressBar />
    </div>
  ),
  ssr: false,
})

const DynamicTextEditor = dynamic(() => import('./NoteCell'), {
  loading: () => (
    <div className="h-1/10 flex flex-col items-center justify-center">
      <ProgressBar />
    </div>
  ),
  ssr: false,
})

const DynamicNoteCell = dynamic(() => import('./NoteCell'), {
  loading: () => (
    <div className="h-1/10 flex flex-col items-center justify-center">
      <ProgressBar />
    </div>
  ),
  ssr: false,
})

// const DynamicRagCell = dynamic(() => import('./RagCell'), {
//   loading: () => (
//     <div className="h-1/10 flex flex-col items-center justify-center">
//       <ProgressBar />
//     </div>
//   ),
//   ssr: false,
// })

// const DynamicTestCell = dynamic(() => import('./TestCell'), {
//   loading: () => (
//     <div className="h-1/10 flex flex-col items-center justify-center">
//       <ProgressBar />
//     </div>
//   ),
//   ssr: false,
// })

const DynamicFlashcardCell = dynamic(() => import('./FlashcardCell'), {
  loading: () => (
    <div className="h-1/10 flex flex-col items-center justify-center">
      <ProgressBar />
    </div>
  ),
  ssr: false,
})

// const DynamicPlanCell = dynamic(() => import('./PlanCell'), {
//   loading: () => (
//     <div className="h-1/10 flex flex-col items-center justify-center">
//       <ProgressBar />
//     </div>
//   ),
//   ssr: false,
// })

// const DynamicMediaCell = dynamic(() => import('./MediaCell'), {
//   loading: () => (
//     <div className="h-1/10 flex flex-col items-center justify-center">
//       <ProgressBar />
//     </div>
//   ),
//   ssr: false,
// })

export { DynamicExcalidraw, DynamicTextEditor, DynamicNoteCell, DynamicFlashcardCell }