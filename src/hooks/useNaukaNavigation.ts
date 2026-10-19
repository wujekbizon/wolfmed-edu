'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useNaukaSearchParams } from '@/hooks/useNaukaSearchParams'
import { useCellsStore } from '@/store/useCellsStore'
import { useRagStore } from '@/store/useRagStore'
import { resolveNaukaTabs } from '@/helpers/resolveNaukaTabs'
import type { NaukaLibraryTab, NaukaTab } from '@/types/naukaLayoutTypes'

export function useNaukaNavigation(isPremium: boolean) {
  const searchParams = useNaukaSearchParams()
  const { active, libraryTab } = resolveNaukaTabs(searchParams.get('tab'), searchParams.get('library'), isPremium)
  const [workspaceOpened, setWorkspaceOpened] = useState(active === 'workspace')
  if (active === 'workspace' && !workspaceOpened) setWorkspaceOpened(true)
  const anchorRef = useRef<HTMLDivElement>(null)

  const setActive = useCallback((tab: NaukaTab, replace = true, library?: NaukaLibraryTab) => {
    const url = new URL(window.location.href)
    url.searchParams.set('tab', tab)
    if (library) url.searchParams.set('library', library)
    if (url.href === window.location.href) return
    if (replace) window.history.replaceState(null, '', url)
    else window.history.pushState(null, '', url)
    window.dispatchEvent(new Event('nauka-navigation'))
  }, [])

  const selectTab = (id: string) => {
    if (id !== 'categories' && id !== 'workspace' && id !== 'library') return
    setActive(id, false)
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
  }, [setActive])

  const selectLibraryTab = (id: string) => {
    const selected = resolveNaukaTabs('library', id, isPremium)
    setActive('library', false, selected.libraryTab)
  }

  return { active, workspaceOpened, libraryTab, selectLibraryTab, selectTab, anchorRef }
}
