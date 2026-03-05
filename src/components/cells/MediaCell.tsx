import ResizableComponent from '../Resizable'
import MediaCellPlayer from './MediaCellPlayer'
import TranscriptPanel from './TranscriptPanel'
import type { Cell, MediaCellContent } from '@/types/cellTypes'

export default function MediaCell({ cell }: { cell: Cell }) {
  let transcript: string | undefined
  try {
    const content = JSON.parse(cell.content) as MediaCellContent
    transcript = content.transcript
  } catch { /* ignore */ }

  return (
    <ResizableComponent direction="vertical">
      <div className="flex flex-col gap-2 h-full">
        {/* Glass player card */}
        <div className="bg-[#ffc5c5]/25 backdrop-blur-xl border border-white/70 rounded-2xl shadow-lg overflow-hidden shrink-0">
          <MediaCellPlayer cell={cell} />
        </div>

        {/* Transcript — separate panel below */}
        {transcript && <TranscriptPanel transcript={transcript} />}
      </div>
    </ResizableComponent>
  )
}
