'use client'

import { useState, useTransition } from 'react'
import { Headphones, Trash2, Clock, Calendar } from 'lucide-react'
import { showToast } from '@/hooks/useToastMessage'
import { deleteLectureAction } from '@/actions/lectures'
import { formatTime } from '@/helpers/formatDate'
import type { Lecture } from '@/server/db/schema'

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
    <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-5 flex flex-col gap-3 hover:border-zinc-300 transition-colors">
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

export default function LecturesSection({ lectures }: { lectures: Lecture[] }) {
  const [filter, setFilter] = useState<'recent' | 'all'>('recent')

  const filteredLectures =
    filter === 'recent'
      ? [...lectures]
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 6)
      : lectures

  return (
    <section className="bg-white p-6 rounded-2xl shadow-xl border border-zinc-200/60">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-zinc-800">Moje Wykłady</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('recent')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === 'recent'
                ? 'bg-slate-700 text-white'
                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-800'
            }`}
          >
            Ostatnio dodane
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-slate-500 text-white'
                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-800'
            }`}
          >
            Wszystkie wykłady
          </button>
        </div>
      </div>
      {filteredLectures.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLectures.map((lecture) => (
            <LectureCard key={lecture.id} lecture={lecture} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-6xl mb-4 text-zinc-300">🎧</div>
          <h3 className="text-xl text-zinc-500 mb-2 font-medium">Brak wykładów</h3>
          <p className="text-zinc-400">Wygeneruj swój pierwszy wykład audio!</p>
        </div>
      )}
    </section>
  )
}
