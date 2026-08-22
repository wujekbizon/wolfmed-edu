'use client'

import { useEffect, useRef, useState } from 'react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
  useSortable,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Check, X, ShieldAlert, Lightbulb, ListChecks } from 'lucide-react'
import { shuffleArray } from '@/helpers/shuffleArray'

interface OrderableStep {
  id: string
  text: string
}

const SAFETY_KEYWORDS = ['rękawicz', 'tożsam', 'imię i nazwisko', 'zgod', 'dezynf', 'umył']

function isSafetyStep(text: string): boolean {
  const lower = text.toLowerCase()
  return SAFETY_KEYWORDS.some((kw) => lower.includes(kw))
}

interface RowProps {
  step: OrderableStep
  position: number
  checked: boolean
  correct: boolean
}

function SortableStepRow({ step, position, checked, correct }: RowProps) {
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
      className={`flex items-center gap-3 rounded-lg border p-3 transition-colors ${statusClass} ${
        isDragging ? 'opacity-50 shadow-lg' : 'shadow-sm'
      }`}
    >
      <span className="shrink-0 w-6 h-6 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-500 text-xs font-bold flex items-center justify-center">
        {position}
      </span>
      <p className="flex-1 text-sm text-zinc-700 leading-snug">{step.text}</p>
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
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="shrink-0 text-zinc-300 hover:text-zinc-500 cursor-grab active:cursor-grabbing touch-none"
        aria-label="Przeciągnij, aby zmienić kolejność"
      >
        <GripVertical className="w-4 h-4" />
      </button>
    </div>
  )
}

interface Props {
  steps: string[]
  onOrderChange: (order: string[]) => void
}

export default function OrderableSteps({ steps, onOrderChange }: Props) {
  const [items, setItems] = useState<OrderableStep[]>([])
  const [checked, setChecked] = useState(false)
  const onOrderChangeRef = useRef(onOrderChange)
  onOrderChangeRef.current = onOrderChange

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  useEffect(() => {
    const withIds: OrderableStep[] = steps.map((text, index) => ({ id: `step-${index}`, text }))
    const shuffled = shuffleArray(withIds)
    setItems(shuffled)
    onOrderChangeRef.current(shuffled.map((s) => s.text))
  }, [steps])

  const correctCount = items.filter((item, index) => item.id === `step-${index}`).length

  const applyOrder = (next: OrderableStep[]) => {
    setItems(next)
    onOrderChangeRef.current(next.map((s) => s.text))
    setChecked(false)
  }

  const handleDragEnd = (event: any) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = items.findIndex((i) => i.id === active.id)
    const newIndex = items.findIndex((i) => i.id === over.id)
    applyOrder(arrayMove(items, oldIndex, newIndex))
  }

  const handleHint = () => {
    const firstWrong = items.findIndex((item, index) => item.id !== `step-${index}`)
    if (firstWrong === -1) return
    const fromIndex = items.findIndex((item) => item.id === `step-${firstWrong}`)
    applyOrder(arrayMove(items, fromIndex, firstWrong))
  }

  return (
    <div className="flex flex-col gap-3">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToVerticalAxis]}
      >
        <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-2">
            {items.map((step, index) => (
              <SortableStepRow
                key={step.id}
                step={step}
                position={index + 1}
                checked={checked}
                correct={step.id === `step-${index}`}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setChecked(true)}
          className="inline-flex items-center gap-1.5 px-3 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-medium rounded-lg border border-zinc-200 transition-colors"
        >
          <ListChecks className="w-3.5 h-3.5" />
          Sprawdź kolejność
        </button>
        <button
          type="button"
          onClick={handleHint}
          className="inline-flex items-center gap-1.5 px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-medium rounded-lg border border-amber-200 transition-colors"
        >
          <Lightbulb className="w-3.5 h-3.5" />
          Podpowiedź
        </button>
        {checked && (
          <span className="text-xs text-zinc-500">
            Poprawnie ułożone: {correctCount} z {items.length}
          </span>
        )}
      </div>
    </div>
  )
}
