import { Video } from 'lucide-react'
import MediaHeader from './MediaHeader'
import PlayerControls from './PlayerControls'

interface VideoStubProps {
  title: string
}

export default function VideoStub({ title }: VideoStubProps) {
  return (
    <div className="flex flex-col h-full">
      <MediaHeader title={title} sourceType="video" />

      <div className="flex-1 flex flex-col items-center justify-center gap-3 min-h-0">
        <div className="p-5 rounded-full bg-black/5">
          <Video className="w-12 h-12 text-zinc-300" />
        </div>
        <p className="text-sm font-medium text-zinc-400">Odtwarzacz wideo wkrótce dostępny</p>
      </div>

      <PlayerControls
        isPlaying={false}
        ended={false}
        speed={1}
        onTogglePlay={() => {}}
        onRestart={() => {}}
        onSkipBack={() => {}}
        onSkipForward={() => {}}
        onSpeedChange={() => {}}
        disabled
      />
    </div>
  )
}
