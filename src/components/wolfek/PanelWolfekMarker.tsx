'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { PANEL_WOLFEK_TARGETS, PANEL_WOLFEK_TOPICS } from '@/constants/panelWolfek'
import type { PanelWolfekTopic } from '@/types/panelWolfekTypes'
import WolfekAvatar from './WolfekAvatar'

export default function PanelWolfekMarker({ topic, onOpen, onDismiss }: {
  topic: PanelWolfekTopic
  onOpen: () => void
  onDismiss: () => void
}) {
  const reduced = useReducedMotion()
  const [position, setPosition] = useState<{ left: number; top: number } | null>(null)

  useEffect(() => {
    const scroller = document.getElementById('scroll-container')
    let target: HTMLElement | null = null
    let frame = 0
    let tabRequested = false
    let sizeObserver: ResizeObserver | null = null
    const update = () => {
      if (!target) return
      const rect = target.getBoundingClientRect()
      if (rect.bottom < 70 || rect.top > window.innerHeight - 48) {
        setPosition(null)
        return
      }
      setPosition({
        left: Math.max(12, Math.min(rect.left + (topic.startsWith('results_') ? -190 : 12), window.innerWidth - 180)),
        top: Math.max(76, Math.min(
          topic.startsWith('results_') ? rect.top + rect.height / 2 - 36 : rect.top - 72,
          window.innerHeight - 84,
        )),
      })
    }
    const schedule = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(update)
    }
    const find = () => {
      if (topic === 'difficult_questions' && !tabRequested) {
        const tab = document.getElementById('panel-analytics-details-tab')
        if (tab) { tab.click(); tabRequested = true }
      }
      const next = document.getElementById(PANEL_WOLFEK_TARGETS[topic])
      if (!next || target) return
      target = next
      sizeObserver = new ResizeObserver(schedule)
      sizeObserver.observe(next)
      const block = next.offsetHeight > (scroller?.clientHeight ?? window.innerHeight) * .8
        ? 'start' : 'center'
      next.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block })
      schedule()
    }
    const mutation = new MutationObserver(find)
    mutation.observe(scroller ?? document.body, { childList: true, subtree: true })
    const timeout = window.setTimeout(onDismiss, 8000)
    scroller?.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    find()
    return () => {
      window.clearTimeout(timeout)
      cancelAnimationFrame(frame)
      mutation.disconnect()
      sizeObserver?.disconnect()
      scroller?.removeEventListener('scroll', schedule)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
    }
  }, [topic, reduced, onDismiss])

  if (!position) return null
  return createPortal(<button type="button" className="panel-wolfek-marker"
    style={{ left: position.left, top: position.top }}
    aria-label={`Wróć do Wolfka: ${PANEL_WOLFEK_TOPICS[topic].label}`} onClick={onOpen}>
    {!reduced && <motion.span className="panel-wolfek-marker-ping" aria-hidden="true"
      animate={{ scale: [1, 1.7], opacity: [.72, 0] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }} />}
    <span className="panel-wolfek-marker-avatar">
      <WolfekAvatar positive={false} supportive interactive={false} />
    </span>
    <span className="panel-wolfek-marker-label">{PANEL_WOLFEK_TOPICS[topic].label}</span>
  </button>, document.body)
}
