'use client'

import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import type { CameraPosition } from '@/types/mannequinTypes'

const ARRIVAL_EPSILON = 0.02
const REPORT_THRESHOLD = 0.05

// Animation runs entirely on refs: setting React state per frame would
// re-render the whole Canvas subtree and, with Fast Refresh remounting it,
// exhaust the browser's WebGL contexts.
export default function MannequinCameraRig({
  goal,
  onDistanceChange,
}: {
  goal: CameraPosition
  onDistanceChange: (distance: number) => void
}) {
  const { camera, controls } = useThree()
  const goalVector = useMemo(() => new THREE.Vector3(...goal), [goal])
  const animating = useRef(false)
  const mounted = useRef(false)
  const reported = useRef(0)

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true
      return
    }
    animating.current = true
  }, [goalVector])

  useFrame(() => {
    const orbit = controls as unknown as { update?: () => void } | null

    if (!animating.current) {
      const distance = camera.position.length()
      if (Math.abs(distance - reported.current) > REPORT_THRESHOLD) {
        reported.current = distance
        onDistanceChange(distance)
      }
      return
    }

    camera.position.lerp(goalVector, 0.15)
    orbit?.update?.()

    if (camera.position.distanceTo(goalVector) < ARRIVAL_EPSILON) {
      camera.position.copy(goalVector)
      animating.current = false
      reported.current = camera.position.length()
      orbit?.update?.()
    }
  })

  return null
}
