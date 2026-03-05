import { Video } from 'lucide-react'
import MediaHeader from './MediaHeader'
import PlayerControls from './PlayerControls'

interface VideoStubProps {
  title: string
}

export default function VideoStub({ title }: VideoStubProps) {
  return (
    <>
      <MediaHeader title={title} sourceType="video" />

      <div className="flex-1 flex flex-col items-center justify-center gap-3 bg-zinc-50 px-5 py-10">
        <div className="p-4 rounded-full bg-zinc-100">
          <Video className="w-10 h-10 text-zinc-300" />
        </div>
        <p className="text-sm font-medium text-zinc-400">Odtwarzacz wideo wkrótce dostepny</p>
        <p className="text-xs text-zinc-300 text-center max-w-xs">
          Wsparcie dla wideo zostanie dodane w kolejnej aktualizacji.
        </p>
      </div>

      <PlayerControls
        isPlaying={false}
        ended={false}
        speed={1}
        onTogglePlay={() => {}}
        onRestart={() => {}}
        onSpeedChange={() => {}}
        disabled
      />
    </>
  )
}
