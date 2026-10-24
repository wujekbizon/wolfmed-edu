'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Check, X, ShieldAlert } from 'lucide-react'
import Button from '@/components/ui/Button'
import { isSafetyStep } from '@/helpers/isSafetyStep'
import type { SortableStepRowProps } from '@/types/orderableStepsTypes'

export default function SortableStepRow({ step, position, checked, correct }: SortableStepRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: step.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const statusClass = checked
    ? correct
      ? 'border-green-300 bg-green-50'
      : 'border-red-300 bg-red-50'
    : 'border-zinc-200 bg-white hover:border-zinc-300'

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 rounded-xl border px-3 py-3 sm:px-4 transition-colors ${statusClass} ${
        isDragging ? 'opacity-50 shadow-lg' : ''
      }`}
    >
      <span className="shrink-0 w-6 h-6 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-500 text-xs font-bold flex items-center justify-center">
        {position}
      </span>
      <p className="min-w-0 flex-1 break-words text-sm text-zinc-700 leading-relaxed">{step.text}</p>
      {isSafetyStep(step.text) && (
        <span title="Krok kluczowy dla bezpieczeństwa" className="shrink-0 text-amber-500">
          <ShieldAlert className="w-4 h-4" />
        </span>
      )}
      {checked && (
        <span className={`shrink-0 ${correct ? 'text-green-600' : 'text-red-500'}`}>
          {correct ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
        </span>
      )}
      <Button
        variant="ghost"
        type="button"
        {...attributes}
        {...listeners}
        className="min-h-11 min-w-11 shrink-0 cursor-grab touch-none text-zinc-400 hover:text-zinc-600 active:cursor-grabbing"
        aria-label="Przeciągnij, aby zmienić kolejność"
      >
        <GripVertical className="w-4 h-4" />
      </Button>
    </div>
  )
}

