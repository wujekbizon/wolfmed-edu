"use client"

import AudioPlayer from './media/AudioPlayer'
import VideoStub from './media/VideoStub'
import type { Cell } from '@/types/cellTypes'
import type { MediaCellContent } from './media/types'

export default function MediaCellPlayer({ cell }: { cell: Cell }) {
  let media: MediaCellContent | null = null
  try {
    media = JSON.parse(cell.content) as MediaCellContent
  } catch {
    return (
      <div className="flex flex-1 items-center justify-center p-4">
        <p className="text-sm text-zinc-500">Nie udalo sie wczytac zasobu multimedialnego.</p>
      </div>
    )
  }

  if (media.sourceType === 'video') {
    return <VideoStub title={media.title} />
  }

  return <AudioPlayer media={media} cellId={cell.id} />
}
