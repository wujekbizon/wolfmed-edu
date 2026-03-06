'use client'

import VideoStub from './VideoStub'
import AudioPlayer from './AudioPlayer'
import type { Cell, MediaCellContent } from '@/types/cellTypes'
import { updateLectureDurationAction } from '@/actions/lectures'

export default function MediaCellPlayer({ cell }: { cell: Cell }) {
  let media: MediaCellContent | null = null
  try {
    media = JSON.parse(cell.content) as MediaCellContent
  } catch {
    return (
      <div className='flex flex-1 items-center justify-center p-4'>
        <p className='text-sm text-zinc-500'>
          Nie udało się wczytać zasobu multimedialnego.
        </p>
      </div>
    )
  }

  const handleDurationLoaded = (duration: number) => {
    if (media!.lectureId) {
      updateLectureDurationAction(media!.lectureId, duration)
    }
  }

  if (media.sourceType === 'video') {
    return <VideoStub title={media.title} />
  }

  return (
    <AudioPlayer
      media={media}
      cellId={cell.id}
      onDurationLoaded={handleDurationLoaded}
    />
  )
}
