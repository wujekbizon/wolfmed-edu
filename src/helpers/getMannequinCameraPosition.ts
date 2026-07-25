import { MANNEQUIN_VIEWS } from '@/constants/mannequinViews'
import type { CameraPosition, MannequinViewKey } from '@/types/mannequinTypes'

export function getMannequinCameraPosition(
  view: MannequinViewKey,
  distance: number
): CameraPosition {
  const [x, y, z] = MANNEQUIN_VIEWS[view].direction
  const length = Math.hypot(x, y, z) || 1
  const scale = distance / length

  return [x * scale, y * scale, z * scale]
}
