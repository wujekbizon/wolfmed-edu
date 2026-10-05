'use client'

import { useRef, useState } from 'react'
import { Video } from 'lucide-react'
import Button from '@/components/ui/Button'
import { KIERUNKI_WOLFEK_VIDEOS } from '@/constants/kierunkiWolfekVideos'
import type { KierunkiCourseVideoButtonProps } from '@/types/kierunkiWolfekTypes'
import KierunkiCoursePresentationModal from './KierunkiCoursePresentationModal'

export default function KierunkiCourseVideoButton({ courseSlug }: KierunkiCourseVideoButtonProps) {
  const [open, setOpen] = useState(false)
  const trigger = useRef<HTMLButtonElement>(null)
  if (!KIERUNKI_WOLFEK_VIDEOS[courseSlug]) return null
  return <>
    <Button ref={trigger} variant="ghost" size="sm" onClick={() => setOpen(true)}>
      <Video size={16} aria-hidden="true" /> Prezentacja
    </Button>
    {open && <KierunkiCoursePresentationModal courseSlug={courseSlug} onClose={() => {
      setOpen(false)
      requestAnimationFrame(() => trigger.current?.focus({ preventScroll: true }))
    }} />}
  </>
}
