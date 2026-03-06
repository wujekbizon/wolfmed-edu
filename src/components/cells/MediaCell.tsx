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

        {/* Glass player card — layered for visible frosted effect */}
        <div className="relative rounded-2xl overflow-hidden shrink-0 shadow-[0_8px_32px_rgba(255,197,197,0.4)]">
          {/* Layer 1: blur backdrop + white/rose tint */}
          <div className="absolute inset-0 bg-white/55 backdrop-blur-2xl" />
          {/* Layer 2: subtle pink overlay for #ffc5c5 warmth */}
          <div className="absolute inset-0 bg-[#ffc5c5]/20" />
          {/* Layer 3: top-edge light reflection */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent" />
          {/* Layer 4: inner top-left shine */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent pointer-events-none" />
          {/* White border */}
          <div className="absolute inset-0 rounded-2xl ring-1 ring-white/70 pointer-events-none" />

          {/* Content sits above all layers */}
          <div className="relative">
            <MediaCellPlayer cell={cell} />
          </div>
        </div>

        {/* Transcript — separate panel below */}
        {transcript && <TranscriptPanel transcript={transcript} />}
      </div>
    </ResizableComponent>
  )
}
