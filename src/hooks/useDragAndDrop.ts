import { useState } from 'react'
import { KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { useProceduresStore } from '@/store/useProceduresStore'
import { useChallengeStore } from '@/store/useChallengeStore'

export function useDragAndDrop() {
  const { setSteps } = useProceduresStore()
  const { isLocked } = useChallengeStore()
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  function handleDragStart(event: any) {
    const { active } = event
    setActiveId(active.id)
  }

  function handleDragEnd(event: any) {
    const { active, over } = event
    setActiveId(null)

    if (isLocked || active.id === over.id) return

    setSteps((steps) => {
      const oldIndex = steps.findIndex((item) => item.id === active.id)
      const newIndex = steps.findIndex((item) => item.id === over.id)

      return arrayMove(steps, oldIndex, newIndex)
    })
  }
  return { sensors, activeId, handleDragStart, handleDragEnd, setActiveId }
}
