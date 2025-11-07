'use client'

import clsx from 'clsx'
import type { Lecture } from '@teaching-playground/core'

export type LectureFilterType = 'all' | 'scheduled' | 'in-progress' | 'completed' | 'cancelled'

interface LectureFilterProps {
  events: Lecture[]
  activeTab: LectureFilterType
  onTabChange: (tab: LectureFilterType) => void
}

const filterButtons: Array<{ type: LectureFilterType; label: string; className: string }> = [
  { type: 'all', label: 'All', className: 'bg-purple-500/10 text-purple-400' },
  { type: 'scheduled', label: 'Scheduled', className: 'bg-blue-500/10 text-blue-400' },
  { type: 'in-progress', label: 'In Progress', className: 'bg-green-500/10 text-green-400' },
  { type: 'completed', label: 'Completed', className: 'bg-zinc-500/10 text-zinc-400' },
  { type: 'cancelled', label: 'Cancelled', className: 'bg-red-500/10 text-red-400' },
]

export default function LectureFilter({ events, activeTab, onTabChange }: LectureFilterProps) {
  return (
    <div className="flex space-x-2">
      {filterButtons.map(({ type, label, className }) => (
        <button
          key={type}
          onClick={() => onTabChange(type)}
          className={clsx(
            'px-3 py-1.5 text-sm rounded-md transition-colors',
            activeTab === type ? className : 'text-zinc-400 hover:bg-zinc-700/50'
          )}
        >
          {label} ({type === 'all' ? events.length : events.filter((e) => e.status === type).length})
        </button>
      ))}
    </div>
  )
}
