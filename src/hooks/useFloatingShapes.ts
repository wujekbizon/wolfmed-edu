import { useState, useEffect, useCallback } from 'react'
import { SHAPE_COLORS } from '@/constants/shapes'
import { generateShape } from '@/helpers/shapeGenerators'
import type { FloatingShape, ShapeConfig } from '@/types/shapes'

export const useFloatingShapes = ({
  count = 5,
  minSize = 50,
  maxSize = 150,
  minDuration = 2,
  maxDuration = 4,
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
