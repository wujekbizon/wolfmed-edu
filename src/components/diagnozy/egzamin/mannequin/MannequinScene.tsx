'use client'

import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import MannequinModel from '@/components/diagnozy/egzamin/mannequin/MannequinModel'
import type { BodyZone } from '@/types/diagnozyTypes'

// Loaded only via next/dynamic (ssr: false) — three.js never reaches the
// server bundle or any route other than the exam.
export default function MannequinScene({
  selectedZone,
  onZoneClick,
}: {
  selectedZone: BodyZone | null
  onZoneClick: (zone: BodyZone) => void
}) {
  return (
    <div
      className="h-105 rounded-xl border border-zinc-200 bg-gradient-to-b from-zinc-50 to-zinc-100 overflow-hidden"
      aria-label="Fantom pacjenta — kliknij część ciała"
    >
      <Canvas camera={{ position: [0, 0.2, 4.2], fov: 45 }}>
        <ambientLight intensity={0.9} />
        <directionalLight position={[3, 4, 5]} intensity={1.1} />
        <directionalLight position={[-3, 2, -4]} intensity={0.4} />
        <Suspense fallback={null}>
          <MannequinModel selectedZone={selectedZone} onZoneClick={onZoneClick} />
        </Suspense>
        <OrbitControls
          enablePan={false}
          enableZoom={false}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={(Math.PI * 2) / 3}
        />
      </Canvas>
    </div>
  )
}
