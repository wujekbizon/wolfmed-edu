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
    <div className="px-5 py-4 shrink-0">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {sourceType === 'video'
            ? <div className="w-16 h-16 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                <Video className="w-7 h-7 text-white/50" />
              </div>
            : <AlbumArt title={title} />
          }
          <div className="min-w-0">
            <p className="text-xs font-medium text-white/40 uppercase tracking-wide">Media Center</p>
            <h3 className="font-semibold text-white text-sm leading-snug truncate">{title}</h3>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {sourceType === 'video' ? (
            <span className="text-xs font-medium text-white/40 bg-white/10 border border-white/20 rounded-full px-3 py-1">
              wkrótce
            </span>
          ) : duration && duration > 0 ? (
            <span className="text-xs font-medium text-white/60 bg-white/10 border border-white/20 rounded-full px-3 py-1">
              {formatTime(duration)}
            </span>
          ) : null}

          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              disabled={isDeleting}
              className="p-1.5 text-white/30 hover:text-red-400 hover:bg-red-900/30 rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
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
