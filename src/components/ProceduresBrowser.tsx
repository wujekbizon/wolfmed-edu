'use client'

import { useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import ProceduresList from '@/components/ProceduresList'
import ProceduresToolbar from '@/components/ProceduresToolbar'
import {
  PROCEDURE_BROWSE_DEFAULT_CRITERIA,
  PROCEDURE_BROWSE_STALE_TIME,
} from '@/constants/procedureBrowse'
import { filterAndSortProcedures } from '@/helpers/filterAndSortProcedures'
import { pluralizePl } from '@/helpers/pluralizePl'
import { useDebouncedValue } from '@/hooks/useDebounceValue'
import type {
  ProcedureBrowseCriteria,
  ProcedureBrowseItem,
  ProcedureCourse,
  ProcedureBrowseSortKey,
  ProcedureBrowseViewState,
} from '@/types/procedureBrowseTypes'

export default function ProceduresBrowser({
  course,
  procedures,
}: {
  course: ProcedureCourse
  procedures: ProcedureBrowseItem[]
}) {
  const [criteria, setCriteria] = useState(PROCEDURE_BROWSE_DEFAULT_CRITERIA)
  const criteriaRef = useRef(criteria)
  criteriaRef.current = criteria
  const savedPanelScrollTopRef = useRef<number | null>(null)
  const [isViewLoaded, setIsViewLoaded] = useState(false)
  const debouncedSearch = useDebouncedValue(criteria.search, 250)
  const effectiveCriteria = { ...criteria, search: debouncedSearch }
  const sourceVersion = procedures.map(({ id, updatedAt }) => [id, updatedAt])
  const onChange = (patch: Partial<ProcedureBrowseCriteria>) =>
    setCriteria((current) => ({ ...current, ...patch }))

  const { data: results } = useQuery({
    queryKey: ['procedures', course, sourceVersion, debouncedSearch, criteria.sort],
    queryFn: async () => filterAndSortProcedures(procedures, effectiveCriteria),
    initialData: () => filterAndSortProcedures(procedures, effectiveCriteria),
    staleTime: PROCEDURE_BROWSE_STALE_TIME,
  })

  const storageKey = `procedure-browser:${course}`
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(storageKey)
      if (raw) {
        const saved = JSON.parse(raw) as Partial<ProcedureBrowseViewState>
        const sortOptions: ProcedureBrowseSortKey[] = ['default', 'name-asc', 'name-desc']
        if (saved.criteria && typeof saved.criteria.search === 'string' && sortOptions.includes(saved.criteria.sort)) {
          setCriteria(saved.criteria)
        }
        if (typeof saved.panelScrollTop === 'number' && Number.isFinite(saved.panelScrollTop) && saved.panelScrollTop >= 0) {
          savedPanelScrollTopRef.current = saved.panelScrollTop
        }
      }
    } catch {
      savedPanelScrollTopRef.current = null
    }
    setIsViewLoaded(true)

    let saveTimer: number | undefined
    const persistView = () => {
      const panelContainer = document.getElementById('scroll-container')
      if (!panelContainer) return
      const viewState: ProcedureBrowseViewState = {
        criteria: criteriaRef.current,
        panelScrollTop: panelContainer.scrollTop,
      }
      try {
        sessionStorage.setItem(storageKey, JSON.stringify(viewState))
      } catch {
        return
      }
    }
    const onScroll = () => {
      window.clearTimeout(saveTimer)
      saveTimer = window.setTimeout(persistView, 150)
    }
    const onNavigation = (event: MouseEvent) => {
      const target = event.target
      if (!(target instanceof Element) || !target.closest('a[href]')) return
      persistView()
    }

    const panelContainer = document.getElementById('scroll-container')
    panelContainer?.addEventListener('scroll', onScroll, { passive: true })
    document.addEventListener('click', onNavigation, true)
    window.addEventListener('pagehide', persistView)
    window.addEventListener('popstate', persistView)
    return () => {
      window.clearTimeout(saveTimer)
      panelContainer?.removeEventListener('scroll', onScroll)
      document.removeEventListener('click', onNavigation, true)
      window.removeEventListener('pagehide', persistView)
      window.removeEventListener('popstate', persistView)
    }
  }, [storageKey])

  useEffect(() => {
    const savedScrollTop = savedPanelScrollTopRef.current
    if (!isViewLoaded || savedScrollTop === null || debouncedSearch !== criteria.search) return
    const timeout = window.setTimeout(() => {
      window.requestAnimationFrame(() => {
        const panelContainer = document.getElementById('scroll-container')
        if (panelContainer) panelContainer.scrollTop = savedScrollTop
        savedPanelScrollTopRef.current = null
      })
    }, 50)
    return () => window.clearTimeout(timeout)
  }, [criteria.search, debouncedSearch, isViewLoaded, results])

  return (
    <section className='flex flex-col items-center px-1 sm:px-4 py-4 w-full h-full'>
      <div className='w-full px-4 pb-4 md:px-6 md:pb-6'>
        <ProceduresToolbar criteria={criteria} onChange={onChange} />
        <p className='text-xs text-zinc-400 mb-4' aria-live='polite'>
          {results.length === procedures.length
            ? `${procedures.length} ${pluralizePl(procedures.length, ['procedura', 'procedury', 'procedur'])}`
            : `${results.length} z ${procedures.length} procedur`}
        </p>
        <ProceduresList procedures={results} />
      </div>
    </section>
  )
}
