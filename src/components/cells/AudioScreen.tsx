import { Headphones } from 'lucide-react'
import { pickGradient } from './AlbumArt'

interface AudioScreenProps {
  title: string
  isPlaying: boolean
}

export default function AudioScreen({ title, isPlaying }: AudioScreenProps) {
  const gradient = pickGradient(title)
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-3 min-h-0 py-4">
      <div className="relative flex items-center justify-center">
        {isPlaying && (
          <div className="absolute w-28 h-28 rounded-full bg-fuchsia-400/20 animate-ping" />
        )}
        <div className={`relative z-10 w-24 h-24 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-xl`}>
          <Headphones className="w-10 h-10 text-white/80" />
        </div>
      </div>
      <p className="text-sm font-medium text-zinc-600 text-center px-4 line-clamp-2 leading-snug">{title}</p>
    </div>
  )
}
