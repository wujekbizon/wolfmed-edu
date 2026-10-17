'use client'

import dynamic from 'next/dynamic'
import { createPortal } from 'react-dom'
import { useEffect, useRef, type KeyboardEvent } from 'react'
import { Video, X } from 'lucide-react'
import Button from '@/components/ui/Button'
import BaseModal from '@/components/modal/BaseModal'
import { PANEL_WOLFEK_TOPICS } from '@/constants/panelWolfek'
import { PANEL_WOLFEK_VIDEOS } from '@/constants/panelWolfekVideos'
import type { PanelWolfekTopic } from '@/types/panelWolfekTypes'

const VideoPlayer = dynamic(() => import('@/components/cells/VideoPlayer'), { ssr: false })

export default function PanelWolfekVideoModal({ topic, onClose }: {
  topic: PanelWolfekTopic
  onClose: () => void
}) {
  const video = PANEL_WOLFEK_VIDEOS[topic]
  const closeButton = useRef<HTMLButtonElement>(null)
  const dialog = useRef<HTMLDivElement>(null)
  useEffect(() => { closeButton.current?.focus() }, [])
  const trapTab = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Tab') return
    const focusable = dialog.current?.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
    )
    if (!focusable?.length) return
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last?.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first?.focus()
    }
  }
  return createPortal(<BaseModal size="xl" fullScreenMobile onClose={onClose}>
    <div ref={dialog} role="dialog" aria-modal="true"
      aria-label={`Film Wolfka: ${video?.title ?? PANEL_WOLFEK_TOPICS[topic].label}`}
      className="panel-wolfek-video-dialog" onKeyDown={trapTab}>
      <Button ref={closeButton} type="button" variant="ghost" size="sm" shape="pill"
        className="panel-wolfek-video-close" aria-label="Zamknij film" onClick={onClose}>
        <X size={19} aria-hidden="true" />
      </Button>
      {video ? <div className="panel-wolfek-video-player">
        <VideoPlayer media={{ sourceType: 'video', title: video.title, url: video.url }} />
      </div> : <div className="panel-wolfek-video-empty" role="status">
        <Video size={32} aria-hidden="true" />
        <h2>{PANEL_WOLFEK_TOPICS[topic].label}</h2>
        <p>Film do tego tematu będzie dostępny wkrótce.</p>
      </div>}
    </div>
  </BaseModal>, document.body)
}
