"use client"

import { useTransition } from 'react'
import { showToast } from '@/hooks/useToastMessage'
import { useCellsStore } from '@/store/useCellsStore'
import VideoStub from './VideoStub'
import AudioPlayer from './AudioPlayer'
import type { Cell, MediaCellContent } from '@/types/cellTypes'
import { deleteLectureAction, updateLectureDurationAction } from '@/actions/lectures'

export default function MediaCellPlayer({ cell }: { cell: Cell }) {
  const deleteCell = useCellsStore(s => s.deleteCell)
  const [isDeleting, startDeleteTransition] = useTransition()

  let media: MediaCellContent | null = null
  try {
    media = JSON.parse(cell.content) as MediaCellContent
  } catch {
    return (
      <div className="flex flex-1 items-center justify-center p-4">
        <p className="text-sm text-zinc-500">Nie udało się wczytać zasobu multimedialnego.</p>
      </div>
    )
  }

  const handleDelete = () => {
    startDeleteTransition(async () => {
      if (media!.lectureId) {
        const result = await deleteLectureAction(media!.lectureId)
        if (result.status === 'ERROR') {
          showToast('ERROR', result.message || 'Nie udało się usunąć wykładu.')
          return
        }
      }
      deleteCell(cell.id)
    })
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
      onDelete={handleDelete}
      isDeleting={isDeleting}
      onDurationLoaded={handleDurationLoaded}
    />
  )
}
