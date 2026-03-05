import { Headphones, Video, Trash2 } from 'lucide-react'
import { formatTime } from '@/helpers/formatDate'

interface MediaHeaderProps {
  title: string
  sourceType: 'audio' | 'video'
  duration?: number
  onDelete?: (() => void) | undefined
  isDeleting?: boolean | undefined
}

export default function MediaHeader({ title, sourceType, duration, onDelete, isDeleting }: MediaHeaderProps) {
  return (
    <div className="bg-gradient-to-r from-rose-50 to-fuchsia-50 border-b border-zinc-200 px-5 py-4 shrink-0">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-gradient-to-br from-[#ff9898] to-fuchsia-400 rounded-lg shrink-0">
            {sourceType === 'video'
              ? <Video className="w-4 h-4 text-white" />
              : <Headphones className="w-4 h-4 text-white" />
            }
          </div>
          <div>
            <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide">Media Center</p>
            <h3 className="font-semibold text-zinc-900 text-sm leading-snug">{title}</h3>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {sourceType === 'video' ? (
            <span className="text-xs font-medium text-zinc-400 bg-zinc-100 border border-zinc-200 rounded-full px-3 py-1">
              wkrótce
            </span>
          ) : duration && duration > 0 ? (
            <span className="text-xs font-medium text-zinc-500 bg-white/70 border border-zinc-200 rounded-full px-3 py-1">
              {formatTime(duration)}
            </span>
          ) : null}

          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              disabled={isDeleting}
              className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              title="Usuń wykład"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
