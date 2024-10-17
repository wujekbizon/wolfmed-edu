import { useState, useEffect, useCallback, useMemo } from 'react'

export function useRotatingList<T>(items: T[], displayCount: number, intervalMs: number) {
  const [startIndex, setStartIndex] = useState(0)

  const updateIndex = useCallback(() => {
    setStartIndex((prevIndex) => (prevIndex + displayCount) % items.length)
  }, [items.length, displayCount])

  useEffect(() => {
    const intervalId = setInterval(updateIndex, intervalMs)
    return () => clearInterval(intervalId)
  }, [updateIndex, intervalMs])

  const visibleItems = useMemo(() => {
    const endIndex = (startIndex + displayCount) % items.length
    if (endIndex > startIndex) {
      return items.slice(startIndex, endIndex)
    } else {
      return [...items.slice(startIndex), ...items.slice(0, endIndex)]
    }
  }, [items, startIndex, displayCount])

  return visibleItems
}
