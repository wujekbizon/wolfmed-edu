"use client"

import VideoStub from './VideoStub'
import type { Cell } from '@/types/cellTypes'
import type { MediaCellContent } from '@/types/cellTypes'
import AudioPlayer from './AudioPlayer'

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
