'use client'

import { useTransition } from 'react'
import Link from 'next/link'
import { Headphones, Trash2, Clock, Calendar, BookOpen } from 'lucide-react'
import { showToast } from '@/hooks/useToastMessage'
import { deleteLectureAction } from '@/actions/lectures'
import { formatTime } from '@/helpers/formatDate'
import type { Lecture } from '@/server/db/schema'

interface LectureLibraryProps {
  lectures: Lecture[]
}

function LectureCard({ lecture }: { lecture: Lecture }) {
  const [isDeleting, startTransition] = useTransition()

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteLectureAction(lecture.id)
      if (result.status === 'ERROR') {
        showToast('ERROR', result.message || 'Nie udało się usunąć wykładu.')
      }
    })
  }

  return (
    <div className="bg-white border border-zinc-200 rounded-xl p-5 flex flex-col gap-3 hover:border-zinc-300 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-gradient-to-br from-[#ff9898]/20 to-fuchsia-100 rounded-lg shrink-0">
            <Headphones className="w-4 h-4 text-[#e07070]" />
          </div>
          <h3 className="font-semibold text-zinc-900 text-sm leading-snug">{lecture.title}</h3>
        </div>
        <button
          type="button"
          onClick={handleDelete}
          disabled={isDeleting}
          className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors disabled:opacity-40 shrink-0"
          title="Usuń wykład"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center gap-4 text-xs text-zinc-500">
        {lecture.duration && (
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {formatTime(lecture.duration)}
          </span>
        )}
        <span className="flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5" />
          {new Date(lecture.createdAt).toLocaleDateString('pl-PL')}
        </span>
      </div>

      {lecture.scriptText && (
        <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">
          {lecture.scriptText.slice(0, 160)}…
        </p>
      )}

      <audio
        controls
        src={lecture.audioUrl}
        className="w-full h-8 mt-1"
        preload="none"
      />
    </div>
  )
}

export default function LectureLibrary({ lectures }: LectureLibraryProps) {
  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-zinc-800 mb-2">Wykłady</h1>
        <p className="text-zinc-600">Twoje wygenerowane wykłady audio</p>
      </div>

      {lectures.length === 0 ? (
        <div className="bg-white border border-zinc-200 rounded-2xl p-12 text-center">
          <div className="inline-flex p-4 bg-zinc-100 rounded-full mb-4">
            <BookOpen className="w-8 h-8 text-zinc-400" />
          </div>
          <h3 className="text-lg font-semibold text-zinc-700 mb-2">Brak wykładów</h3>
          <p className="text-sm text-zinc-500 mb-6">
            Wygeneruj wykład ze swojego planu nauki, a znajdziesz go tutaj.
          </p>
          <Link
            href="/panel/nauka"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#ff9898] to-fuchsia-400 text-white text-sm rounded-lg hover:opacity-90 transition-opacity"
          >
            Przejdź do planów nauki
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {lectures.map(lecture => (
            <LectureCard key={lecture.id} lecture={lecture} />
          ))}
        </div>
      )}
    </div>
  )
}
