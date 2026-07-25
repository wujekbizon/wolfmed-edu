import { useCallback, useEffect, useRef, useState } from 'react'
import { getNextOptionIndex } from '@/helpers/getNextOptionIndex'
import { findOptionByPrefix } from '@/helpers/findOptionByPrefix'
import type { SelectOption } from '@/types/uiTypes'

const TYPEAHEAD_RESET_MS = 600

export function useDropdownSelect(
  options: SelectOption[],
  value: string | null,
  onSelect: (value: string) => void
) {
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)
  const typeahead = useRef({ query: '', at: 0 })

  const selectedIndex = options.findIndex((option) => option.value === value)

  const openAt = useCallback(
    (index: number) => {
      setOpen(true)
      setActiveIndex(index >= 0 ? index : Math.max(selectedIndex, 0))
    },
    [selectedIndex]
  )

  const close = useCallback(() => {
    setOpen(false)
    setActiveIndex(-1)
  }, [])

  const commit = useCallback(
    (index: number) => {
      const option = options[index]
      if (!option) return
      onSelect(option.value)
      close()
    },
    [options, onSelect, close]
  )

  useEffect(() => {
    if (!open) return
    const onClickOutside = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) close()
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [open, close])

  const runTypeahead = (key: string) => {
    const now = Date.now()
    typeahead.current.query =
      now - typeahead.current.at > TYPEAHEAD_RESET_MS ? key : typeahead.current.query + key
    typeahead.current.at = now

    const match = findOptionByPrefix(options, typeahead.current.query)
    if (match !== -1) setActiveIndex(match)
  }

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') return close()

    if (!open) {
      if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown') {
        event.preventDefault()
        openAt(selectedIndex)
      }
      return
    }

    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowUp':
        event.preventDefault()
        setActiveIndex((prev) =>
          getNextOptionIndex(prev, event.key === 'ArrowDown' ? 1 : -1, options.length, selectedIndex)
        )
        break
      case 'Home':
        event.preventDefault()
        setActiveIndex(0)
        break
      case 'End':
        event.preventDefault()
        setActiveIndex(options.length - 1)
        break
      case 'Enter':
      case ' ':
        event.preventDefault()
        commit(activeIndex)
        break
      case 'Tab':
        close()
        break
      default:
        if (event.key.length === 1) runTypeahead(event.key)
    }
  }

  return { open, activeIndex, setActiveIndex, containerRef, openAt, close, commit, onKeyDown }
}
