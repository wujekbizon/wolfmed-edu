'use client'

import { useState, useEffect, useActionState } from 'react'
import { useRouter } from 'next/navigation'
import { DndContext, closestCorners, DragOverlay, PointerSensor, useSensor, useSensors, KeyboardSensor } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { SortableItem } from '@/components/SortableItem'
import SubmitButton from '@/components/SubmitButton'
import OrderStepsChallengeSkeleton from '@/components/skeletons/OrderStepsChallengeSkeleton'
import {  useToastMessage } from '@/hooks/useToastMessage'
import { submitOrderStepsAction } from '@/actions/challenges'
import { shuffleArray } from '@/helpers/shuffleArray'
import { EMPTY_FORM_STATE } from '@/constants/formState'
import type { Procedure, StepWithId } from '@/types/dataTypes'
import Link from 'next/link'
import { getProcedureSlugFromId } from '@/constants/procedureSlugs'

interface Props {
  procedure: Procedure
}

export default function OrderStepsChallenge({ procedure }: Props) {
  const router = useRouter()
  const procedureSlug = getProcedureSlugFromId(procedure.id) || procedure.id
  const [steps, setSteps] = useState<StepWithId[]>([])
  const [startTime] = useState(Date.now())
  const [state, action] = useActionState(submitOrderStepsAction, EMPTY_FORM_STATE)
  const [activeId, setActiveId] = useState<string | null>(null)
  const noScriptFallback = useToastMessage(state)

  // Configure sensors with activation constraints for better drag feel
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Drag must move 8px before activating (prevents accidental drags)
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  function handleDragStart(event: any) {
    setActiveId(event.active.id)
  }

  useEffect(() => {
    if (state.status === 'SUCCESS') {

      const timer = setTimeout(() => {
        router.push(`/panel/procedury/${procedureSlug}/wyzwania`)
      }, 1500)
    }
  }, [state.status, procedure.id])

  // Initialize shuffled steps
  useEffect(() => {
    const stepsWithIds: StepWithId[] = procedure.data.algorithm.map((item, index) => ({
      ...item,
      id: `step-${index}`,
    }))
    setSteps(shuffleArray(stepsWithIds))
  }, [procedure])

  function handleDragEnd(event: any) {
    const { active, over } = event
    setActiveId(null)

    if (over && active.id !== over.id) {
      setSteps((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)
        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  // Calculate time spent for submission
  const getTimeSpent = () => Math.floor((Date.now() - startTime) / 1000)

  if (steps.length === 0) {
    return <OrderStepsChallengeSkeleton />
  }

  return (
    <section className="flex flex-col items-center gap-8 px-4 sm:px-6 py-8 md:py-10 w-full h-full overflow-y-auto scrollbar-webkit bg-gradient-to-br from-zinc-50 via-white to-zinc-50">
      <div className="w-full md:w-[85%] lg:w-3/4 xl:w-2/3 2xl:w-[55%] bg-white p-6 md:p-8 lg:p-10 rounded-xl shadow-xl border border-zinc-200">
        {/* Header Section */}
        <div className="mb-6 space-y-3">
          {/* Title */}
          <h2 className="text-2xl font-bold text-zinc-800">
            Uporządkuj kroki procedury
          </h2>

          {/* Procedure Name */}
          <h3 className="text-lg font-semibold text-zinc-600">
            {procedure.data.name}
          </h3>

          {/* Instruction Box */}
          <div className="bg-zinc-100/80 border-l-4 border-zinc-400 rounded-md p-4">
            <p className="text-base text-zinc-500 leading-relaxed">
              Przeciągnij i upuść kroki w prawidłowej kolejności. Użyj uchwytu do przesuwania elementów.
            </p>
          </div>
        </div>

        {/* Drag and Drop Area */}
        <div className="mb-8">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            modifiers={[restrictToVerticalAxis]}
            autoScroll={{
              threshold: { x: 0, y: 0.2 },
              acceleration: 10,
            }}
          >
            <SortableContext items={steps.map((item) => item.id)} strategy={verticalListSortingStrategy}>
              <div className="flex flex-col gap-3">
                {steps.map((item, index) => (
                  <SortableItem
                    key={item.id}
                    id={item.id}
                    step={item.step}
                    isLocked={false}
                    isActive={item.id === activeId}
                    index={index}
                  />
                ))}
              </div>
            </SortableContext>
            <DragOverlay>
              {activeId ? (
                <SortableItem
                  id={activeId}
                  step={steps.find((item) => item.id === activeId)?.step || ''}
                  isLocked={false}
                  isActive={true}
                  index={0}
                />
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>

        {/* Action Buttons */}
        <form action={action} className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <input type="hidden" name="stepOrder" value={JSON.stringify(steps)} />
          <input type="hidden" name="procedureId" value={procedure.id} />
          <input type="hidden" name="procedureName" value={procedure.data.name} />
          <input type="hidden" name="timeSpent" value={getTimeSpent()} />

          <SubmitButton
            label="Zatwierdź Odpowiedź"
            loading="Sprawdzanie..."
            className="flex-1 sm:flex-initial h-11 sm:h-12 px-8 bg-zinc-800 hover:bg-zinc-900 active:bg-zinc-950 text-white font-semibold text-base tracking-wide rounded-lg border border-zinc-700 shadow-sm hover:shadow-md transition-all duration-150 hover:-translate-y-0.5"
          />

          <Link
            href={`/panel/procedury/${procedure.id}/wyzwania`}
            className="h-11 sm:h-12 w-full sm:w-auto px-8 inline-flex items-center justify-center gap-2 bg-white hover:bg-zinc-50 active:bg-zinc-100 text-zinc-700 font-semibold text-base tracking-wide rounded-lg border-2 border-zinc-300 shadow-sm hover:shadow-md transition-all duration-150 hover:-translate-y-0.5"
          >
            Anuluj
          </Link>

          {noScriptFallback}
        </form>
      </div>
    </section>
  )
}
