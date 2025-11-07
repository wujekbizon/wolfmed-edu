import type { Lecture } from '@teaching-playground/core'
import clsx from 'clsx'

interface LectureCardProps {
  lecture: Lecture
}

export function LectureCard({ lecture }: LectureCardProps) {
  const statusColors = {
    scheduled: 'bg-blue-500/10 text-blue-400',
    'in-progress': 'bg-green-500/10 text-green-400',
    completed: 'bg-zinc-500/10 text-zinc-400',
    cancelled: 'bg-red-500/10 text-red-400',
    delayed: 'bg-yellow-500/10 text-yellow-400',
  }

  return (
    <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4 hover:border-zinc-600 transition-colors">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-medium text-zinc-100">{lecture.name}</h3>
          <p className="text-sm text-zinc-400 mt-1">
            {new Date(lecture.date).toLocaleString()}
          </p>
        </div>
        <span
          className={clsx(
            'px-2 py-1 rounded-md text-xs font-medium',
            statusColors[lecture.status]
          )}
        >
          {lecture.status}
        </span>
      </div>
      
      <div className="mt-4 space-y-2">
        <div className="flex items-center text-sm text-zinc-400">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          Room: {lecture.roomId}
        </div>
        {lecture.description && (
          <p className="text-sm text-zinc-400 line-clamp-2">{lecture.description}</p>
        )}
        {lecture.maxParticipants && (
          <div className="flex items-center text-sm text-zinc-400">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Max Participants: {lecture.maxParticipants}
          </div>
        )}
      </div>
    </div>
  )
} 