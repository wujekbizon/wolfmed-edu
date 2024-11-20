import type { FloatingShape } from '@/types/shapes'

const SHAPE_CONSTANTS = {
  PADDING: 10,
  X_RANGE: 80,
  Y_RANGE: 85,
} as const

export const generateRandomNumber = (min: number, max: number): number => {
  return Math.random() * (max - min) + min
}

export const generateRandomPosition = (axis: 'x' | 'y'): string => {
  const { PADDING, X_RANGE, Y_RANGE } = SHAPE_CONSTANTS
  const range = axis === 'x' ? X_RANGE : Y_RANGE
  return `${generateRandomNumber(PADDING, range)}%`
}

export const generateShape = (
  index: number,
  {
    minSize,
    maxSize,
    minDuration,
    maxDuration,
    colors,
  }: {
    minSize: number
    maxSize: number
    minDuration: number
    maxDuration: number
    colors: readonly string[]
  }
): FloatingShape => {
  return {
    width: generateRandomNumber(minSize, maxSize),
    height: generateRandomNumber(minSize, maxSize),
    left: generateRandomPosition('x'),
    top: generateRandomPosition('y'),
    duration: generateRandomNumber(minDuration, maxDuration),
    color: colors[index % colors.length],
  }
}
