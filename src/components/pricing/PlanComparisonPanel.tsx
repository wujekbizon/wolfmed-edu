'use client'

import { useEffect, useRef } from 'react'
import { usePlanComparisonStore } from '@/store/usePlanComparisonStore'
import { PLAN_COMPARISON_PANEL_ID } from '@/constants/planComparisonPanel'

export default function PlanComparisonPanel({
  children
}: {
  children: React.ReactNode
}) {
  const isOpen = usePlanComparisonStore((state) => state.isOpen)
  const panel = useRef<HTMLDivElement>(null)

  // Keyed on isOpen rather than on mount: the component renders either way and
  // only returns null when closed, so a mount-once effect would never see the
  // panel appear. Focus moves first, with the scroll suppressed, so the jump
  // that follows is the one scroll-mt lines up under the navbar.
  useEffect(() => {
    if (!isOpen) return

    panel.current?.focus({ preventScroll: true })
    panel.current?.scrollIntoView({ block: 'start' })
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      ref={panel}
      id={PLAN_COMPARISON_PANEL_ID}
      tabIndex={-1}
      className='scroll-mt-24 outline-none'
    >
      {children}
    </div>
  )
}
