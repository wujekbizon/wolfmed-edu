'use client'

import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { getShortestAngleDelta } from '@/helpers/getShortestAngleDelta'
import type { CameraPosition } from '@/types/mannequinTypes'

const EASING = 0.15
const ANGLE_EPSILON = 0.01
const RADIUS_EPSILON = 0.02
const REPORT_THRESHOLD = 0.05

// Orbits on the sphere rather than lerping the position: a straight line from
// front to back passes through the orbit target, where the radius collapses to
// zero and OrbitControls clamps the camera back out along an arbitrary angle.
//
// Animation runs on refs alone — setting React state per frame would re-render
// the whole Canvas subtree and exhaust the browser's WebGL contexts.
export default function MannequinCameraRig({
  goal,
  onDistanceChange,
}: {
  goal: CameraPosition
  onDistanceChange: (distance: number) => void
}) {
  const { camera, controls } = useThree()
  const goalSpherical = useMemo(
    () => new THREE.Spherical().setFromVector3(new THREE.Vector3(...goal)),
    [goal]
  )
  const current = useRef(new THREE.Spherical())
  const animating = useRef(false)
  const mounted = useRef(false)
  const reported = useRef(0)

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true
      return
    }
    animating.current = true
  }, [goalSpherical])

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

    const spherical = current.current.setFromVector3(camera.position)
    const deltaTheta = getShortestAngleDelta(spherical.theta, goalSpherical.theta)
    const deltaPhi = goalSpherical.phi - spherical.phi
    const deltaRadius = goalSpherical.radius - spherical.radius

    const arrived =
      Math.abs(deltaTheta) < ANGLE_EPSILON &&
      Math.abs(deltaPhi) < ANGLE_EPSILON &&
      Math.abs(deltaRadius) < RADIUS_EPSILON

    if (arrived) {
      camera.position.setFromSpherical(goalSpherical)
      animating.current = false
      reported.current = camera.position.length()
    } else {
      spherical.theta += deltaTheta * EASING
      spherical.phi += deltaPhi * EASING
      spherical.radius += deltaRadius * EASING
      spherical.makeSafe()
      camera.position.setFromSpherical(spherical)
    }

    camera.lookAt(0, 0, 0)
    orbit?.update?.()
  })

  return null
}
