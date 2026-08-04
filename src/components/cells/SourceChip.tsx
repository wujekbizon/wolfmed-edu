import { BookOpen, FileText, StickyNote } from 'lucide-react'
import type { ChunkOrigin, SourceRef } from '@/types/retrievalTypes'

// The student's own sources are visually distinct from the curriculum on
// purpose. Retrieval labels chunks by origin for the model; showing the reader
// one undifferentiated list would mean an answer resting on their own
// half-written note looks exactly like one resting on the documentation, which
// is the thing indexing notes was allowed on condition of avoiding.
const ORIGIN_STYLES: Record<ChunkOrigin, { chip: string; title: string }> = {
  corpus: {
    chip: 'bg-blue-100 text-blue-800',
    title: 'Baza wiedzy',
  },
  material: {
    chip: 'bg-amber-100 text-amber-900',
    title: 'Twój materiał',
  },
  note: {
    chip: 'bg-emerald-100 text-emerald-900',
    title: 'Twoja notatka',
  },
}

const ORIGIN_ICONS: Record<ChunkOrigin, typeof BookOpen> = {
  corpus: BookOpen,
  material: FileText,
  note: StickyNote,
}

export default function SourceChip({ source }: { source: SourceRef }) {
  const style = ORIGIN_STYLES[source.origin]
  const Icon = ORIGIN_ICONS[source.origin]

  return (
    <span
      title={style.title}
      className={`inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium ${style.chip}`}
    >
      <Icon className="h-3 w-3 shrink-0" aria-hidden />
      <span className="sr-only">{style.title}: </span>
      {source.label}
    </span>
  )
}
