'use client'

import { useEffect } from 'react'
import { animate, useMotionValue, useReducedMotion, useTransform } from 'framer-motion'
import type { ExamWolfekReviewProps } from '@/types/examHubTypes'

export function useExamWolfekReview({ active, replay, avatarRef, gaze, reviewTargetId }: ExamWolfekReviewProps) {
  const reduced = useReducedMotion()
  const reviewX = useMotionValue(0)
  const reviewY = useMotionValue(0)
  const blend = useMotionValue(0)
  const x = useTransform(() => gaze.x.get() * (1 - blend.get()) + reviewX.get() * blend.get())
  const y = useTransform(() => gaze.y.get() * (1 - blend.get()) + reviewY.get() * blend.get())

  useEffect(() => {
    if (reduced) {
      blend.set(0)
      return
    }
    let cancelled = false
    const controls: { stop: () => void }[] = []
    const move = (value: typeof reviewX, target: number, duration: number, delay = 0) => {
      const control = animate(value, target, { duration, delay, ease: 'easeInOut' })
      controls.push(control)
      return control
    }
    const review = async () => {
      reviewX.set(gaze.x.get())
      reviewY.set(gaze.y.get())
      blend.set(1)
      await Promise.all([move(reviewX, 1.5, .3), move(reviewY, 1.8, .3)])
      if (cancelled) return
      const avatar = avatarRef.current?.getBoundingClientRect()
      const tab = document.getElementById(reviewTargetId ?? `exam-hub-tab-${active}`)?.getBoundingClientRect()
      const dx = avatar && tab ? tab.left + tab.width / 2 - avatar.left - avatar.width / 2 : 0
      const dy = avatar && tab ? tab.top + tab.height / 2 - avatar.top - avatar.height / 2 : 1
      const distance = Math.max(1, Math.hypot(dx, dy))
      await Promise.all([move(reviewX, dx / distance * 2.2, .35, .85), move(reviewY, dy / distance * 1.8, .35, .85)])
      if (!cancelled) await move(blend, 0, .35, .55)
    }
    void review()
    return () => {
      cancelled = true
      controls.forEach((control) => control.stop())
      blend.set(0)
    }
  }, [active, replay, reduced, avatarRef, gaze.x, gaze.y, blend, reviewX, reviewY, reviewTargetId])

  return { x, y }
}
