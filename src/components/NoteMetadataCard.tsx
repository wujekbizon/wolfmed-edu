import { formatDate } from '@/helpers/formatDate'
import { Calendar, Clock, Tag, FolderOpen } from 'lucide-react'

interface NoteMetadataCardProps {
  title: string
  category: string
  tags: unknown
  pinned: boolean
  createdAt: string
  updatedAt: string
}

export default function NoteMetadataCard({
  title,
  category,
  tags,
  pinned,
  createdAt,
  updatedAt
}: NoteMetadataCardProps) {
  const tagArray = Array.isArray(tags) ? tags : []

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-zinc-200/60 shadow-xl overflow-hidden animate-scaleIn opacity-0 hover:shadow-2xl transition-shadow duration-300 mb-6" style={{ '--slidein-delay': '0.3s' } as React.CSSProperties}>
      <div className="p-6 sm:p-8 bg-linear-to-br from-white/60 to-rose-50/20">
        <div className="flex items-start justify-between gap-4 mb-6">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-zinc-900 flex-1 leading-tight">
            {title}
          </h1>
          {pinned && (
            <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-linear-to-r from-amber-50 to-amber-100/50 text-amber-700 border border-amber-200/60 rounded-full text-xs font-semibold shadow-sm">
              <span className="text-base">📌</span>
              Przypięta
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 rounded-lg bg-linear-to-br from-[#ff9898]/10 to-[#ffc5c5]/10 flex items-center justify-center">
            <FolderOpen className="w-4 h-4 text-[#ff9898]" />
          </div>
          <span className="inline-flex items-center px-4 py-2 bg-linear-to-r from-[#ff9898]/10 to-[#ffc5c5]/10 text-[#ff9898] border border-[#ff9898]/20 rounded-full text-sm font-semibold shadow-sm hover:shadow-md transition-shadow duration-200">
            {category}
          </span>
        </div>
        {tagArray.length > 0 && (
          <div className="flex items-start gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-zinc-100/80 flex items-center justify-center shrink-0">
              <Tag className="w-4 h-4 text-zinc-600" />
            </div>
            <div className="flex flex-wrap gap-2">
              {tagArray.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1.5 bg-zinc-50 hover:bg-zinc-100 text-zinc-700 rounded-lg text-xs font-medium border border-zinc-200/60 shadow-sm transition-all duration-200 hover:shadow-md hover:scale-105"
                >
                  {String(tag)}
                </span>
              ))}
            </div>
          </div>
        )}
        <div className="flex flex-wrap items-center gap-6 text-sm text-zinc-500">
          <div className="flex items-center gap-2 group">
            <div className="w-7 h-7 rounded-lg bg-zinc-100/80 flex items-center justify-center group-hover:bg-zinc-200/80 transition-colors duration-200">
              <Calendar className="w-3.5 h-3.5" />
            </div>
            <span>Utworzono: <span className="font-medium text-zinc-700">{formatDate(createdAt)}</span></span>
          </div>
          <div className="flex items-center gap-2 group">
            <div className="w-7 h-7 rounded-lg bg-zinc-100/80 flex items-center justify-center group-hover:bg-zinc-200/80 transition-colors duration-200">
              <Clock className="w-3.5 h-3.5" />
            </div>
            <span>Zaktualizowano: <span className="font-medium text-zinc-700">{formatDate(updatedAt)}</span></span>
          </div>
        </div>
      </div>
    </div>
  )
}
