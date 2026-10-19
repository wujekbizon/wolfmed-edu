'use client'

import { useEffect, useRef, useState } from 'react'
import { useCellsStore } from '@/store/useCellsStore'
import { useRagStore } from '@/store/useRagStore'
import type { NaukaTab } from '@/types/naukaLayoutTypes'

export function useNaukaNavigation() {
  const [active, setActive] = useState<NaukaTab>('categories')
  const anchorRef = useRef<HTMLDivElement>(null)

  const selectTab = (id: string) => {
    if (id !== 'categories' && id !== 'workspace' && id !== 'library') return
    setActive(id)
    const container = document.getElementById('scroll-container')
    if (container && anchorRef.current) {
      const offset = anchorRef.current.getBoundingClientRect().top - container.getBoundingClientRect().top
      if (offset < 0) container.scrollTo({ top: container.scrollTop + offset, behavior: 'instant' })
    }
  }

  useEffect(() => {
    const rag = useRagStore.getState()
    if (rag.pendingTopic || rag.pendingAutoSubmitCellId) setActive('workspace')
    const unsubscribeRag = useRagStore.subscribe((state, previous) => {
      if (state.pendingTopic && state.pendingTopic !== previous.pendingTopic) setActive('workspace')
    })
    const unsubscribeCells = useCellsStore.subscribe((state, previous) => {
      if (previous.initialized && state.order !== previous.order && state.order.some((id) => !previous.order.includes(id))) {
        setActive('workspace')
      }
    })
    return () => {
      unsubscribeRag()
      unsubscribeCells()
    }
  }, [])

  return { active, selectTab, anchorRef }
}
