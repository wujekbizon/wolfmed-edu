import type { MannequinView, MannequinViewKey } from '@/types/mannequinTypes'

export const DEFAULT_VIEW_DISTANCE = 4.2
export const MIN_VIEW_DISTANCE = 2.4
export const MAX_VIEW_DISTANCE = 6.4
export const VIEW_DISTANCE_STEP = 0.6

// Side keys follow the PATIENT's anatomy, not the screen: a figure facing the
// camera has its left side toward +x, so "lewy bok" orbits to screen-right.
// Charting is always patient-relative, so the labels must match that.
export const MANNEQUIN_VIEWS: Record<MannequinViewKey, MannequinView> = {
  front: { label: 'Przód', direction: [0, 0.1, 1] },
  back: { label: 'Tył', direction: [0, 0.1, -1] },
  left: { label: 'Lewy bok', direction: [1, 0.1, 0] },
  right: { label: 'Prawy bok', direction: [-1, 0.1, 0] },
}

export const MANNEQUIN_VIEW_KEYS = Object.keys(MANNEQUIN_VIEWS) as MannequinViewKey[]
