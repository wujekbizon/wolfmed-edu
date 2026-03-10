import { useState, useEffect } from 'react'
import { generateShape } from '@/helpers/shapeGenerators'
import type { FloatingShape, ShapeConfig } from '@/types/shapes'

const SHAPE_COLORS = [
  'bg-[#82a61e]/10',     // Bad bacteria (greenish, slightly toxic look)
  'bg-[#a66ca6]/10',     // Virus (reddish/purple, danger vibe)
  'bg-[#c6dff7]/40',     // Healthy human cell (soothing cyan/blue)
] as const

/**
 * Generates a set of randomised floating shapes for decorative background animations.
 * Re-generates whenever any config value changes. Shape generation runs only in an
 * effect so it never blocks the initial render.
 *
 * @param config Constraints for shape count, size range, and animation duration range
 * @returns Array of fully resolved floating shape descriptors ready for rendering
 */
export const useFloatingShapes = ({
  count = 5,
  minSize = 25,
  maxSize = 100,
  minDuration = 10,
  maxDuration = 20,
}: ShapeConfig): FloatingShape[] => {
  const [shapes, setShapes] = useState<FloatingShape[]>([])

  useEffect(() => {
    setShapes(
      Array.from({ length: count }, (_, i) =>
        generateShape(i, { minSize, maxSize, minDuration, maxDuration, colors: SHAPE_COLORS }),
      ),
    )
  }, [count, minSize, maxSize, minDuration, maxDuration])

  return shapes
}
