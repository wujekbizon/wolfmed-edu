'use client'

import { useState, useEffect } from 'react'
import { DndContext, closestCenter, DragOverlay } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { SortableItem } from '@/components/SortableItem'
import ChallengeButton from '@/components/ChallengeButton'
import { useDragAndDrop } from '@/hooks/useDragAndDrop'
import { completeChallengeAction } from '@/actions/challenges'
import type { Procedure, StepWithId } from '@/types/dataTypes'
import { ChallengeType } from '@/types/challengeTypes'

interface Props {
  procedure: Procedure
}

function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array]
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
  }
  return newArray
}

export default function OrderStepsChallenge({ procedure }: Props) {
  const router = useRouter()
  const [steps, setSteps] = useState<StepWithId[]>([])
  const [isLocked, setIsLocked] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [startTime] = useState(Date.now())

  const { sensors, activeId, handleDragStart, handleDragEnd: originalHandleDragEnd } = useDragAndDrop()

  // Initialize shuffled steps
  useEffect(() => {
    const stepsWithIds: StepWithId[] = procedure.data.algorithm.map((item, index) => ({
      ...item,
      id: `step-${index}`,
    }))
    setSteps(shuffleArray(stepsWithIds))
  }, [procedure])

  const handleDragEnd = (event: any) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setSteps((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)
        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  function calculateScore(correctSteps: { step: string }[], userSteps: StepWithId[]): number {
    if (correctSteps.length === 0) return 0

    let correctCount = 0
    for (let i = 0; i < correctSteps.length; i++) {
      if (correctSteps[i].step === userSteps[i]?.step) {
        correctCount++
      }
    }

    return Math.round((correctCount / correctSteps.length) * 100)
  }

  async function submitAnswer() {
    const score = calculateScore(procedure.data.algorithm, steps)
    const timeSpent = Math.floor((Date.now() - startTime) / 1000) // seconds

    setIsLocked(true)
    setIsSubmitting(true)

    toast.success(`Twój wynik: ${score}%`, {
      duration: 3000,
      position: 'bottom-center',
    })

    try {
      const result = await completeChallengeAction(
        procedure.id,
        procedure.data.name,
        ChallengeType.ORDER_STEPS,
        score,
        timeSpent
      )

      if (result.success) {
        if (result.data?.badgeEarned) {
          toast.success('🎉 Gratulacje! Zdobyłeś odznakę!', {
            duration: 5000,
            position: 'top-center',
          })
        }

        // Redirect back to challenges list after 2 seconds
        setTimeout(() => {
          router.push(`/panel/procedury/${procedure.id}/wyzwania`)
        }, 2000)
      } else {
        toast.error(result.error || 'Failed to save progress')
        setIsLocked(false)
        setIsSubmitting(false)
      }
    } catch (error) {
      console.error('Submit error:', error)
      toast.error('Failed to submit challenge')
      setIsLocked(false)
      setIsSubmitting(false)
    }
  }

  function handleCancel() {
    router.push(`/panel/procedury/${procedure.id}/wyzwania`)
  }

  if (steps.length === 0) {
    return <div className="p-4">Loading...</div>
  }

  return (
    <div className="flex flex-col items-center gap-8 px-1 sm:px-4 py-4 w-full min-h-screen">
      <div className="w-full md:w-[85%] lg:w-3/4 xl:w-2/3 2xl:w-[60%] bg-zinc-100 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-2 text-zinc-800">
          Uporządkuj kroki procedury
        </h2>
        <h3 className="text-lg mb-6 text-zinc-600">{procedure.data.name}</h3>

        <div className="mb-8">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            autoScroll={{
              threshold: { x: 0, y: 0.2 },
              acceleration: 10,
            }}
          >
            <SortableContext items={steps.map((item) => item.id)} strategy={verticalListSortingStrategy}>
              <div className="flex flex-col space-y-4">
                {steps.map((item) => (
                  <SortableItem
                    key={item.id}
                    id={item.id}
                    step={item.step}
                    isLocked={isLocked}
                    isActive={item.id === activeId}
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
                />
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <ChallengeButton onClick={submitAnswer} disabled={isLocked || isSubmitting}>
            {isLocked ? 'Odpowiedź zatwierdzona' : 'Zatwierdź Odpowiedź'}
          </ChallengeButton>
          <ChallengeButton onClick={handleCancel} disabled={isSubmitting}>
            Anuluj
          </ChallengeButton>
        </div>
      </div>
    </div>
  )
}
