import { useState, useEffect, useCallback } from 'react'
import { generateShape } from '@/helpers/shapeGenerators'
import type { FloatingShape, ShapeConfig } from '@/types/shapes'

const SHAPE_COLORS = [
  'bg-[#82a61e]/10',     // Bad bacteria (greenish, slightly toxic look)
  'bg-[#a66ca6]/10',     // Virus (reddish/purple, danger vibe)
  'bg-[#c6dff7]/40',     // Healthy human cell (soothing cyan/blue)
] as const

export const useFloatingShapes = ({
  count = 5,
  minSize = 25,
  maxSize = 100,
  minDuration = 10,
  maxDuration = 20,

}: ShapeConfig): FloatingShape[] => {
  const [shapes, setShapes] = useState<FloatingShape[]>([])

  const generateShapes = useCallback(() => {
    return Array.from({ length: count }, (_, i) =>
      generateShape(i, {
        minSize,
        maxSize,
        minDuration,
        maxDuration,
        colors: SHAPE_COLORS,
      })
    )
  }, [count, maxDuration, maxSize, minDuration, minSize])

  useEffect(() => {
    setShapes(generateShapes())
  }, [generateShapes])

  return shapes
}
