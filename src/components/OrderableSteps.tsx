'use client'

import { DndContext, closestCenter } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { Lightbulb, ListChecks } from 'lucide-react'
import Button from '@/components/ui/Button'
import SortableStepRow from '@/components/SortableStepRow'
import { useOrderableSteps } from '@/hooks/useOrderableSteps'
import type { OrderableStepsProps } from '@/types/orderableStepsTypes'

export default function OrderableSteps(props: OrderableStepsProps) {
  const { items, checked, setChecked, sensors, correctCount, handleDragEnd, handleHint } = useOrderableSteps(props)
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
        <Button
          variant="secondary"
          type="button"
          onClick={() => setChecked(true)}
          className="inline-flex items-center gap-1.5 min-h-11 px-3 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-medium rounded-lg border border-zinc-200 transition-colors"
        >
          <ListChecks className="w-3.5 h-3.5" />
          Sprawdź kolejność
        </Button>
        <Button
          variant="secondary"
          type="button"
          onClick={handleHint}
          className="inline-flex items-center gap-1.5 min-h-11 px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-medium rounded-lg border border-amber-200 transition-colors"
        >
          <Lightbulb className="w-3.5 h-3.5" />
          Podpowiedź
        </Button>
        {checked && (
          <span className="text-xs text-zinc-500">
            Poprawnie ułożone: {correctCount} z {items.length}
          </span>
        )}
      </div>
    </div>
  )
}
