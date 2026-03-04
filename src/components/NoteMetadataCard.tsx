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
    <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-zinc-200/60 shadow-xl overflow-hidden animate-fadeInUp opacity-0 hover:shadow-2xl transition-shadow duration-300">
      <div className="p-4 sm:p-5 bg-linear-to-br from-white/60 to-rose-50/20">

        {/* Pinned badge */}
        {pinned && (
          <div className="mb-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-linear-to-r from-amber-50 to-amber-100/50 text-amber-700 border border-amber-200/60 rounded-full text-xs font-semibold shadow-sm">
              <span>📌</span>
              Przypięta
            </span>
          </div>
        )}

        {/* Title */}
        <h1 className="text-lg sm:text-xl font-bold text-zinc-900 leading-snug mb-4">
          {title}
        </h1>

        {/* Category */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-lg bg-linear-to-br from-[#ff9898]/10 to-[#ffc5c5]/10 flex items-center justify-center shrink-0">
            <FolderOpen className="w-3.5 h-3.5 text-[#ff9898]" />
          </div>
          <span className="inline-flex items-center px-3 py-1.5 bg-linear-to-r from-[#ff9898]/10 to-[#ffc5c5]/10 text-[#ff9898] border border-[#ff9898]/20 rounded-full text-xs font-semibold shadow-sm">
            {category}
          </span>
        </div>

        {/* Tags */}
        {tagArray.length > 0 && (
          <div className="flex items-start gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-zinc-100/80 flex items-center justify-center shrink-0">
              <Tag className="w-3.5 h-3.5 text-zinc-500" />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {tagArray.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2.5 py-1 bg-zinc-50 hover:bg-zinc-100 text-zinc-600 rounded-lg text-xs font-medium border border-zinc-200/60 shadow-sm transition-all duration-200"
                >
                  {String(tag)}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Divider */}
        <div className="h-px bg-linear-to-r from-transparent via-zinc-200 to-transparent mb-4" />

        {/* Dates — stacked on mobile + desktop sidebar, row on tablet */}
        <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:gap-4 lg:flex-col lg:gap-2.5 text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-zinc-100/80 flex items-center justify-center shrink-0">
              <Calendar className="w-3 h-3" />
            </div>
            <span>Utworzono: <span className="font-medium text-zinc-700">{formatDate(createdAt)}</span></span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-zinc-100/80 flex items-center justify-center shrink-0">
              <Clock className="w-3 h-3" />
            </div>
            <span>Zaktualizowano: <span className="font-medium text-zinc-700">{formatDate(updatedAt)}</span></span>
          </div>
        </div>

      </div>
    </div>
  )
}
