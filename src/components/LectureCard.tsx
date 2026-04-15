'use client'

import { useTransition } from 'react'
import { Headphones, Trash2, Clock, Calendar } from 'lucide-react'
import { showToast } from '@/hooks/useToastMessage'
import { deleteLectureAction } from '@/actions/lectures'
import { formatTime } from '@/helpers/formatDate'
import { useCellsStore } from '@/store/useCellsStore'
import type { MediaCellContent } from '@/types/cellTypes'
import type { Lecture } from '@/server/db/schema'

export default function LectureCard({ lecture }: { lecture: Lecture }) {
  const [isDeleting, startTransition] = useTransition()
  const { order, insertCellAfterWithContent } = useCellsStore()

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteLectureAction(lecture.id)
      if (result.status === 'ERROR') {
        showToast('ERROR', result.message || 'Nie udało się usunąć wykładu.')
      }
    })
  }

  const handleListen = () => {
    const content = JSON.stringify({
      sourceType: 'audio',
      title: lecture.title,
      url: lecture.audioUrl,
      lectureId: lecture.id,
      transcript: lecture.scriptText ?? undefined
    } satisfies MediaCellContent)
    const lastCellId = order[order.length - 1] ?? null
    const newId = insertCellAfterWithContent(lastCellId, 'media', content)
    setTimeout(() => {
      document
        .getElementById(`cell-${newId}`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 50)
  }

  return (
    <div className='bg-zinc-50 border border-zinc-200 rounded-xl p-5 flex flex-col gap-3 hover:border-zinc-300 transition-colors'>
      <div className='flex items-start justify-between gap-3'>
        <div className='flex items-center gap-2.5'>
          <div className='p-2 bg-gradient-to-br from-[#ff9898]/20 to-fuchsia-100 rounded-lg shrink-0'>
            <Headphones className='w-4 h-4 text-[#e07070]' />
          </div>
          <h3 className='font-semibold text-zinc-900 text-sm leading-snug'>
            {lecture.title}
          </h3>
        </div>
      </div>

      <div className='flex items-center gap-4 text-xs text-zinc-500'>
        {lecture.duration && (
          <span className='flex items-center gap-1'>
            <Clock className='w-3.5 h-3.5' />
            {formatTime(lecture.duration)}
          </span>
        )}
        <span className='flex items-center gap-1'>
          <Calendar className='w-3.5 h-3.5' />
          {new Date(lecture.createdAt).toLocaleDateString('pl-PL')}
        </span>
      </div>

      {lecture.scriptText && (
        <p className='text-xs text-zinc-500 line-clamp-2 leading-relaxed'>
          {lecture.scriptText.slice(0, 160)}…
        </p>
      )}
      <div className='flex items-center justify-between gap-2'>
        <button
          onClick={handleListen}
          className='flex items-center gap-2 px-3 py-1.5 cursor-pointer rounded-lg bg-gradient-to-r from-[#ff9898]/20 to-fuchsia-100 text-[#e07070] text-xs font-medium hover:from-[#ff9898]/30 transition-colors w-fit'
        >
          <Headphones className='w-3.5 h-3.5' />
          Słuchaj
        </button>
        <button
          type='button'
          onClick={handleDelete}
          disabled={isDeleting}
          className='p-1.5 text-zinc-600 cursor-pointer hover:text-red-500 hover:bg-red-50 rounded-md transition-colors disabled:opacity-40 shrink-0'
          title='Usuń wykład'
        >
          <Trash2 className='w-4 h-4' />
        </button>
      </div>
    </div>
  )
}