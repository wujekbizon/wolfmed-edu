'use client'

import { useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import type { CameraPosition } from '@/types/mannequinTypes'

// Animates toward a requested preset, then clears it so OrbitControls keeps
// full ownership of the camera — otherwise the rig would fight manual orbiting.
export default function MannequinCameraRig({
  target,
  onArrive,
}: {
  target: CameraPosition | null
  onArrive: () => void
}) {
  const { camera, controls } = useThree()
  const goal = useMemo(() => (target ? new THREE.Vector3(...target) : null), [target])

  useFrame(() => {
    if (!goal) return

    camera.position.lerp(goal, 0.18)
    camera.lookAt(0, 0, 0)
    ;(controls as unknown as { update?: () => void } | null)?.update?.()

    if (camera.position.distanceTo(goal) < 0.03) {
      camera.position.copy(goal)
      onArrive()
    }
  })

  return null
}
