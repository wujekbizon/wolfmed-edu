'use client'
import { useEffect, useState } from 'react'

type CharData = {
  char: string
  delay: string
}

type UseWigglyTextResult = {
  chars: CharData[]
  isHoverable: boolean
}

// startIdx continues the stagger sequence across multiple words,
// replicating the SCSS @for $i from 1 through 35 { animation-delay: #{$i / 10}s } pattern
export function useWigglyText(text: string, startIdx: number = 1): UseWigglyTextResult {
  const [isHoverable, setIsHoverable] = useState(false)

  const chars: CharData[] = Array.from(text).map((char, i) => ({
    char,
    delay: `${(startIdx + i) * 0.025}s`,
  }))

  useEffect(() => {
    const lastDelay = (startIdx + chars.length - 1) * 0.025
    // last char stagger + bounceIn duration (0.6s)
    const totalMs = (lastDelay + 0.6) * 1000

    const timer = setTimeout(() => setIsHoverable(true), totalMs)
    return () => clearTimeout(timer)
  }, [text, startIdx, chars.length])

  return { chars, isHoverable }
}