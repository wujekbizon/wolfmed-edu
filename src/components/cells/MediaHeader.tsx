import { Video } from 'lucide-react'
import AlbumArt from './AlbumArt'

interface MediaHeaderProps {
  title: string
  sourceType: 'audio' | 'video'
}

export default function MediaHeader({ title, sourceType }: MediaHeaderProps) {
  return (
    <div className="px-4 py-3 shrink-0">
      <div className="flex items-center gap-3">
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
    </div>
  )
}
