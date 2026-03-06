import { Video, Trash2 } from 'lucide-react'
import { formatTime } from '@/helpers/formatDate'
import AlbumArt from './AlbumArt'

interface MediaHeaderProps {
  title: string
  sourceType: 'audio' | 'video'
  duration?: number
  onDelete?: (() => void) | undefined
  isDeleting?: boolean | undefined
}

export default function MediaHeader({ title, sourceType, duration, onDelete, isDeleting }: MediaHeaderProps) {
  return (
    <div className="px-4 py-3 shrink-0">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {sourceType === 'video'
            ? <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-zinc-100 flex items-center justify-center shrink-0">
                <Video className="w-5 h-5 text-zinc-400" />
              </div>
            : <AlbumArt title={title} className="w-10 h-10 sm:w-12 sm:h-12" />
          }
          <div className="min-w-0">
            <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">Media Center</p>
            <h3 className="font-semibold text-zinc-800 text-sm leading-snug truncate">{title}</h3>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {sourceType === 'video' ? (
            <span className="text-xs font-medium text-zinc-400 bg-zinc-100 border border-zinc-200 rounded-full px-2.5 py-0.5">
              wkrótce
            </span>
          ) : duration && duration > 0 ? (
            <span className="text-xs font-medium text-zinc-500 bg-white/60 border border-zinc-200 rounded-full px-2.5 py-0.5">
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
