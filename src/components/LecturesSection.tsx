'use client'

import { useState } from 'react'
import type { Lecture } from '@/server/db/schema'
import LectureCard from './LectureCard'

export default function LecturesSection({ lectures }: { lectures: Lecture[] }) {
  const [filter, setFilter] = useState<'recent' | 'all'>('recent')

  const filteredLectures =
    filter === 'recent'
      ? [...lectures]
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
          .slice(0, 6)
      : lectures

  return (
    <section className='bg-white p-4 sm:p-6 rounded-2xl shadow-xl border border-zinc-200/60'>
      <div className='flex flex-wrap justify-between items-center gap-y-3 mb-6'>
        <h2 className='text-base sm:text-xl font-bold text-zinc-800'>
          Moje Wykłady
        </h2>
        <div className='flex gap-1.5 sm:gap-2'>
          <button
            onClick={() => setFilter('recent')}
            className={`px-2.5 py-1 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-colors ${
              filter === 'recent'
                ? 'bg-slate-700 text-white'
                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-800'
            }`}
          >
            Ostatnio dodane
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-2.5 py-1 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-colors ${
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
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {filteredLectures.map((lecture) => (
            <LectureCard key={lecture.id} lecture={lecture} />
          ))}
        </div>
      ) : (
        <div className='text-center py-12'>
          <div className='text-6xl mb-4 text-zinc-300'>🎧</div>
          <h3 className='text-xl text-zinc-500 mb-2 font-medium'>
            Brak wykładów
          </h3>
          <p className='text-zinc-400'>Wygeneruj swój pierwszy wykład audio!</p>
        </div>
      )}
    </section>
  )
}
