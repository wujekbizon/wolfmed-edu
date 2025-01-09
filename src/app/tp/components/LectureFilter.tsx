import clsx from 'clsx'
import { Lecture } from '../../../../packages/core/src/interfaces/event.interface'

export type LectureFilterType = 'all' | 'scheduled' | 'in-progress' | 'completed' | 'cancelled'

interface LectureFilterProps {
  activeTab: LectureFilterType
  onTabChange: (tab: LectureFilterType) => void
  events: Lecture[]
}

const filterButtons: Array<{ type: LectureFilterType; label: string; className: string }> = [
  { type: 'all', label: 'All', className: 'bg-purple-500' },
  { type: 'scheduled', label: 'Scheduled', className: 'bg-blue-500' },
  { type: 'in-progress', label: 'In Progress', className: 'bg-green-500' },
  { type: 'completed', label: 'Completed', className: 'bg-gray-500' },
  { type: 'cancelled', label: 'Cancelled', className: 'bg-red-500' },
]

export default function LectureFilter({ activeTab, onTabChange, events }: LectureFilterProps) {
  return (
    <div className="flex space-x-2">
      {filterButtons.map(({ type, label, className }) => (
        <button
          key={type}
          onClick={() => onTabChange(type)}
          className={clsx(
            'px-4 py-2 text-sm rounded-lg',
            activeTab === type ? `${className} text-white` : 'text-gray-600 hover:bg-gray-100'
          )}
        >
          {label} ({type === 'all' ? events.length : events.filter((e) => e.status === type).length})
        </button>
      ))}
    </div>
  )
}
