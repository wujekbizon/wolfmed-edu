'use client'

import { ContactShadows, Environment, Lightformer } from '@react-three/drei'

// Image-based lighting built from Lightformers rather than an HDR preset:
// drei's presets fetch from a CDN, and this scene must stay self-contained.
// A key, a cool rim and a broad fill give the skin shading to work with, so
// the highlighted region reads against the body instead of flattening it.
export default function MannequinStageLighting() {
  return (
    <>
      <ambientLight intensity={0.25} />
      <directionalLight position={[3, 4, 5]} intensity={0.75} castShadow />
      <directionalLight position={[-4, 2, -3]} intensity={0.25} color="#dbeafe" />

      <Environment resolution={256}>
        <Lightformer
          intensity={1.1}
          position={[2, 3, 4]}
          scale={[6, 6, 1]}
          form="rect"
          color="#ffffff"
        />
        <Lightformer
          intensity={0.7}
          position={[-4, 1, -3]}
          scale={[5, 5, 1]}
          form="rect"
          color="#bfdbfe"
        />
        <Lightformer
          intensity={0.4}
          position={[0, -3, 2]}
          scale={[8, 4, 1]}
          form="rect"
          color="#fef3c7"
        />
      </Environment>

      <ContactShadows
        position={[0, -1.22, 0]}
        opacity={0.25}
        scale={5}
        blur={2.6}
        far={2}
      />
    </>
  )
}
