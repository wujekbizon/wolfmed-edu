'use client'

/**
 * Visible patient body. Based on "Human Models Set - Male/Female (Rigged)"
 * (https://sketchfab.com/3d-models/human-models-set-malefemale-rigged-7311fcfdc03e4234900eeced42a1e669)
 * by lzyassoul, licensed CC-BY-4.0 — see public/models/CREDITS.md.
 *
 * The glb was pruned to the single low-poly non-rigged male figure. This
 * component self-normalizes: it measures the model's real bounds at runtime and
 * scales/centers it to TARGET_HEIGHT at the origin, so the click-hotspots in
 * MannequinModel (expressed as fractions of that height) line up on any model.
 */

import { useLayoutEffect, useMemo, useRef } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

export const MANNEQUIN_HEIGHT = 2.4

export default function MannequinGLTF() {
  const { scene } = useGLTF('/models/mannequin.glb')
  const model = useMemo(() => scene.clone(true), [scene])
  const ref = useRef<THREE.Group>(null)

  useLayoutEffect(() => {
    const group = ref.current
    if (!group) return
    const box = new THREE.Box3().setFromObject(model)
    const size = new THREE.Vector3()
    const center = new THREE.Vector3()
    box.getSize(size)
    box.getCenter(center)
    const scale = MANNEQUIN_HEIGHT / (size.y || 1)
    group.scale.setScalar(scale)
    group.position.set(-center.x * scale, -center.y * scale, -center.z * scale)
  }, [model])

  return (
    <group ref={ref}>
      <primitive object={model} />
    </group>
  )
}

useGLTF.preload('/models/mannequin.glb')
