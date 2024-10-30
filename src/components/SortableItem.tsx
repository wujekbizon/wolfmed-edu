'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface SortableItemProps {
  id: string
  step: string
  isLocked: boolean
  isActive: boolean
}

export function SortableItem({ id, step, isLocked, isActive }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
    disabled: isLocked,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    filter: isDragging ? 'blur(2px)' : 'none',
    backgroundColor: isActive ? '#f0f0f0' : 'white',
    borderColor: isActive ? '#f58a8a' : '#ffc5c5',
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`p-4 rounded shadow border-2 w-full flex flex-col items-center justify-center transition-all  hover:shadow-md hover:scale-[1.02] ${
        isLocked ? 'cursor-not-allowed' : 'cursor-move'
      } ${isActive ? 'shadow-lg' : ''}`}
    >
      <p className="text-sm xs:text-base lg:text-lg text-center">{step}</p>
    </div>
  )
}
