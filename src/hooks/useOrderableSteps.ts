'use client'

import { useEffect, useRef, useState } from 'react'
import { PointerSensor, KeyboardSensor, useSensor, useSensors } from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { shuffleArray } from '@/helpers/shuffleArray'
import type { OrderableStep, OrderableStepsProps } from '@/types/orderableStepsTypes'

export function useOrderableSteps({ steps, onOrderChange }: OrderableStepsProps) {
  const [items, setItems] = useState<OrderableStep[]>([])
  const [checked, setChecked] = useState(false)
  const onOrderChangeRef = useRef(onOrderChange)
  useEffect(() => {
    onOrderChangeRef.current = onOrderChange
  }, [onOrderChange])

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

  const handleDragEnd = (event: DragEndEvent) => {
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

  return { items, checked, setChecked, sensors, correctCount, handleDragEnd, handleHint }
}
