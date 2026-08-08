'use client'

import { usePlanComparisonStore } from '@/store/usePlanComparisonStore'
import { PLAN_COMPARISON_PANEL_ID } from '@/constants/planComparisonPanel'

export default function PlanComparisonPanel({
  children
}: {
  children: React.ReactNode
}) {
  const isOpen = usePlanComparisonStore((state) => state.isOpen)

  if (!isOpen) return null

  return <div id={PLAN_COMPARISON_PANEL_ID}>{children}</div>
}
