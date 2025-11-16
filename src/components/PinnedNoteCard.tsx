'use client'

import Link from 'next/link'
import type { NotesType } from '@/types/notesTypes'

interface PinnedNoteCardProps {
  note: NotesType
  index?: number
}

export default function PinnedNoteCard({ note, index = 0 }: PinnedNoteCardProps) {
  const truncatedText = note.plainText?.slice(0, 120) || note.excerpt?.slice(0, 120) || 'Brak treści'
  const hasMore = (note.plainText || note.excerpt || '').length > 120

  return (
    <article
      className="group relative bg-white ring-1 ring-zinc-200 hover:ring-slate-900/10 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 min-h-[140px]"
      style={{
        animation: 'var(--animate-slideInUp)',
        '--slidein-delay': `${index * 0.05}s`
      } as React.CSSProperties}
    >
      {/* Category Badge */}
      {note.category && (
        <div className="mb-3">
          <span className="inline-flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full bg-gradient-to-r from-slate-800/5 via-[#ff9898]/10 to-[#ffc5c5]/10 text-slate-700 ring-1 ring-slate-900/5">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
            {note.category}
          </span>
        </div>
      )}

      {/* Title */}
      <h4 className="text-base font-bold text-slate-900 mb-2.5 line-clamp-2 leading-snug">
        {note.title || 'Bez tytułu'}
      </h4>

      {/* Excerpt/Preview */}
      <p className="text-sm text-zinc-600 leading-relaxed max-h-[80px] overflow-y-auto scrollbar-webkit mb-4">
        {truncatedText}
        {hasMore && '...'}
      </p>

      {/* Gradient Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-zinc-200 to-transparent mb-4" />

      {/* Footer with Link */}
      <div className="flex items-center justify-end">
        <Link
          href={`/panel/nauka/notatki/${note.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-[#ff9898] transition-colors group/link"
        >
          <span>Zobacz</span>
          <svg className="w-3.5 h-3.5 transition-transform group-hover/link:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      {/* Subtle Pin Indicator */}
      <div className="absolute top-5 right-5 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-br from-[#ff9898] to-[#ffc5c5]" />
      </div>
    </article>
  )
}
