import { useEffect, useRef, useState } from 'react'

interface UseInfiniteScroll<T> {
  data: T[]
  itemsPerPage: number
  threshold?: number
  delay?: number
}

export function useInfiniteScroll<T>({ data, itemsPerPage, threshold = 0.1, delay = 0 }: UseInfiniteScroll<T>) {
  const [displayedItems, setDisplayedItems] = useState(itemsPerPage)
  const [isLoading, setIsLoading] = useState(false)
  const loadMoreRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && displayedItems < data.length && !isLoading) {
          setIsLoading(true)

          setTimeout(() => {
            setDisplayedItems((prev) => Math.min(prev + itemsPerPage, data.length))
            setIsLoading(false)
          }, delay)
        }
      },
      { threshold }
    )

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current)
    }

    return () => observer.disconnect()
  }, [displayedItems, data.length, itemsPerPage, threshold, delay, isLoading])

  const hasMore = displayedItems < data.length
  const visibleItems = data.slice(0, displayedItems)

  return {
    visibleItems,
    hasMore,
    isLoading,
    loadMoreRef,
  }
}
