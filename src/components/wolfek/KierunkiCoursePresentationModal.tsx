'use client'

import dynamic from 'next/dynamic'
import { createPortal } from 'react-dom'
import { useEffect, useRef, type KeyboardEvent } from 'react'
import { Video, X } from 'lucide-react'
import Button from '@/components/ui/Button'
import BaseModal from '@/components/modal/BaseModal'
import { KIERUNKI_WOLFEK_VIDEOS } from '@/constants/kierunkiWolfekVideos'
import type { KierunkiWolfekCourseSlug } from '@/types/kierunkiWolfekTypes'

const VideoPlayer = dynamic(() => import('@/components/cells/VideoPlayer'), { ssr: false })

export default function KierunkiCoursePresentationModal({ courseSlug, onClose }: {
  courseSlug: KierunkiWolfekCourseSlug
  onClose: () => void
}) {
  const video = KIERUNKI_WOLFEK_VIDEOS[courseSlug]
  const closeButton = useRef<HTMLButtonElement>(null)
  const dialog = useRef<HTMLDivElement>(null)
  useEffect(() => { closeButton.current?.focus() }, [])
  if (!video) return null
  const trapTab = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Tab') return
    const focusable = dialog.current?.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
    )
    if (!focusable?.length) return
    if (event.shiftKey && document.activeElement === focusable[0]) {
      event.preventDefault()
      focusable[focusable.length - 1]?.focus()
    } else if (!event.shiftKey && document.activeElement === focusable[focusable.length - 1]) {
      event.preventDefault()
      focusable[0]?.focus()
    }
  }

  return createPortal(<BaseModal size="xl" fullScreenMobile onClose={onClose}>
    <div ref={dialog} className="kierunki-wolfek-video-dialog" role="dialog" aria-modal="true"
      aria-label={video.title} onKeyDown={trapTab}>
      <Button ref={closeButton} type="button" variant="ghost" size="sm" shape="pill"
        className="panel-wolfek-video-close" onClick={onClose} aria-label="Zamknij prezentację">
        <X size={19} aria-hidden="true" />
      </Button>
      <div className="kierunki-wolfek-video-heading"><Video size={18} aria-hidden="true" /><h2>{video.title}</h2></div>
      <div className="panel-wolfek-video-player">
        <VideoPlayer media={{ sourceType: 'video', title: video.title, url: video.url }} />
      </div>
    </div>
  </BaseModal>, document.body)
}
