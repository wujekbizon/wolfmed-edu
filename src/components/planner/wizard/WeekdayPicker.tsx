'use client'

import { WEEKDAYS } from '@/constants/planner'

export default function WeekdayPicker({
  studyDays,
  onToggle,
}: {
  studyDays: number[]
  onToggle: (day: number) => void
}) {
  return (
    <div className="flex gap-2">
      {WEEKDAYS.map((day) => (
        <button
          key={day.value}
          type="button"
          onClick={() => onToggle(day.value)}
          className={`w-11 h-11 rounded-lg text-sm font-semibold border transition-colors ${
            studyDays.includes(day.value)
              ? 'bg-red-500 text-white border-red-500'
              : 'bg-white text-zinc-500 border-zinc-200 hover:border-zinc-400'
          }`}
        >
          {day.label}
        </button>
      ))}
    </div>
  )
}
