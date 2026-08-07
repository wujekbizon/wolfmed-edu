import type { ExcalidrawElement } from '@excalidraw/excalidraw/element/types'
import { FIT_PADDING, MAX_FIT_ZOOM, MIN_FIT_ZOOM } from '@/constants/diagramCanvas'

interface Size {
  width: number
  height: number
}

export interface FitView {
  zoom: number
  scrollX: number
  scrollY: number
  /** True when fitting everything would have been unreadable, so zoom was capped. */
  isClamped: boolean
}

/**
 * Where to put the camera so the whole diagram is visible *and* legible.
 *
 * Fitting a 20-node algorithm into a phone-sized cell lands around 15% zoom —
 * technically the whole diagram, practically a thumbnail nobody can read, and
 * the student zooms in by hand immediately. The fit zoom is therefore clamped
 * to a readable range and the view centred on the drawing.
 *
 * Nothing here asks whether the device is a phone: a phone is simply a small
 * canvas, and the clamp reacts to the space available.
 */
export function computeFitView(
  elements: readonly ExcalidrawElement[],
  canvas: Size
): FitView | null {
  if (elements.length === 0 || canvas.width === 0 || canvas.height === 0) return null

  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity

  for (const element of elements) {
    minX = Math.min(minX, element.x)
    minY = Math.min(minY, element.y)
    maxX = Math.max(maxX, element.x + element.width)
    maxY = Math.max(maxY, element.y + element.height)
  }

  if (!Number.isFinite(minX) || !Number.isFinite(minY)) return null

  const width = Math.max(maxX - minX, 1)
  const height = Math.max(maxY - minY, 1)
  const raw = Math.min(
    (canvas.width * FIT_PADDING) / width,
    (canvas.height * FIT_PADDING) / height
  )
  const zoom = Math.min(Math.max(raw, MIN_FIT_ZOOM), MAX_FIT_ZOOM)

  const centreX = (minX + maxX) / 2
  const centreY = (minY + maxY) / 2

  return {
    zoom,
    scrollX: canvas.width / (2 * zoom) - centreX,
    scrollY: canvas.height / (2 * zoom) - centreY,
    isClamped: raw < MIN_FIT_ZOOM || raw > MAX_FIT_ZOOM,
  }
}
