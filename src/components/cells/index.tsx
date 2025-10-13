import dynamic from 'next/dynamic'
import ProgressBar from './ProgressBar'

const DynamicExcalidraw = dynamic(() => import('./NoteCell'), {
  loading: () => (
    <div className="dynamic-loader">
      <ProgressBar />
    </div>
  ),
  ssr: false,
})

const DynamicTextEditor = dynamic(() => import('./NoteCell'), {
  loading: () => (
    <div className="dynamic-loader">
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


export { DynamicExcalidraw, DynamicTextEditor, DynamicNoteCell}
