import { useEffect, useRef } from 'react'

export function useScrollToTopOnChange(dependency: unknown) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    ref.current?.scrollTo({ top: 0 })
  }, [dependency])

  return ref
}
