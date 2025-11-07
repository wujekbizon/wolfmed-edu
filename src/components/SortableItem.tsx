'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface SortableItemProps {
  id: string
  step: string
  isLocked: boolean
  isActive: boolean
  index?: number
}

export function SortableItem({ id, step, isLocked, isActive, index = 0 }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
    disabled: isLocked,
    transition: {
      duration: 200,
      easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
    },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        '--slidein-delay': `${index * 0.05}s`,
      } as React.CSSProperties}
      {...attributes}
      {...listeners}
      className={`
        bg-white
        border-2
        rounded-lg
        p-4 sm:p-5 lg:p-6
        min-h-[80px]
        flex flex-col
        items-center
        justify-center
        touch-manipulation
        transition-all duration-150
        animate-fadeInUp
        ${isLocked ? 'cursor-not-allowed' : 'cursor-grab'}
        ${isDragging
          ? 'opacity-40 bg-zinc-100 border-dashed border-zinc-300'
          : isActive
            ? 'border-zinc-400 shadow-2xl cursor-grabbing z-50'
            : 'border-zinc-200 shadow-sm hover:bg-zinc-50 hover:border-zinc-300 hover:shadow-md hover:scale-[1.01]'
        }
      `}
    >
      {/* Drag handle indicator */}
      <div className={`w-10 h-1 rounded-full mb-3 transition-colors duration-150 ${
        isActive ? 'bg-zinc-500' : 'bg-zinc-300 group-hover:bg-zinc-400'
      }`} />

      {/* Step text */}
      <p className="text-sm sm:text-base lg:text-lg font-medium text-zinc-800 text-center leading-relaxed">
        {step}
      </p>
    </div>
  )
}
