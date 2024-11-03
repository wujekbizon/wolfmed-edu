export interface FloatingShape {
  width: number
  height: number
  left: string
  top: string
  duration: number
  color: string | undefined
}

export interface ShapeConfig {
  count?: number | undefined
  minSize?: number
  maxSize?: number
  minDuration?: number
  maxDuration?: number
}
