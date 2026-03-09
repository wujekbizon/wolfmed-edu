import { useCallback, useState } from 'react'
import {
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { useProceduresStore } from '@/store/useProceduresStore'
import { useChallengeStore } from '@/store/useChallengeStore'

const keyboardSensorOptions = { coordinateGetter: sortableKeyboardCoordinates }

export function useDragAndDrop() {
  const { setSteps } = useProceduresStore()
  const { isLocked } = useChallengeStore()
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, keyboardSensorOptions),
    useSensor(TouchSensor)
  )

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }, [])

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      setActiveId(null)

      if (isLocked || !over || active.id === over.id) return

      setSteps((steps) => {
        const oldIndex = steps.findIndex((item) => item.id === active.id)
        const newIndex = steps.findIndex((item) => item.id === over.id)
        return arrayMove(steps, oldIndex, newIndex)
      })
    },
    [isLocked, setSteps]
  )

  return { sensors, activeId, handleDragStart, handleDragEnd, setActiveId }
}
