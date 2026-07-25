'use client'

import { Suspense, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import MannequinModel from '@/components/diagnozy/egzamin/mannequin/MannequinModel'
import MannequinCameraRig from '@/components/diagnozy/egzamin/mannequin/MannequinCameraRig'
import MannequinViewControls from '@/components/diagnozy/egzamin/mannequin/MannequinViewControls'
import { getMannequinCameraPosition } from '@/helpers/getMannequinCameraPosition'
import {
  DEFAULT_VIEW_DISTANCE,
  MANNEQUIN_VIEWS,
  MAX_VIEW_DISTANCE,
  MIN_VIEW_DISTANCE,
  VIEW_DISTANCE_STEP,
} from '@/constants/mannequinViews'
import type { BodyZone } from '@/types/diagnozyTypes'
import type { CameraPosition, MannequinViewKey } from '@/types/mannequinTypes'

// Loaded only via next/dynamic (ssr: false) — three.js never reaches the
// server bundle or any route other than the exam.
export default function MannequinScene({
  selectedZone,
  onZoneClick,
}: {
  selectedZone: BodyZone | null
  onZoneClick: (zone: BodyZone) => void
}) {
  const [view, setView] = useState<MannequinViewKey>('front')
  const [distance, setDistance] = useState(DEFAULT_VIEW_DISTANCE)
  const [target, setTarget] = useState<CameraPosition | null>(null)

  const moveTo = (nextView: MannequinViewKey, nextDistance: number) => {
    setView(nextView)
    setDistance(nextDistance)
    setTarget(getMannequinCameraPosition(nextView, nextDistance))
  }

  const zoomBy = (delta: number) =>
    moveTo(view, Math.min(MAX_VIEW_DISTANCE, Math.max(MIN_VIEW_DISTANCE, distance + delta)))

  return (
    <div
      className="relative h-105 rounded-xl border border-zinc-200 bg-gradient-to-b from-zinc-50 to-zinc-100 overflow-hidden"
      aria-label="Fantom pacjenta — kliknij część ciała"
    >
      <Canvas camera={{ position: [0, 0.2, DEFAULT_VIEW_DISTANCE], fov: 45 }}>
        <ambientLight intensity={0.9} />
        <directionalLight position={[3, 4, 5]} intensity={1.1} />
        <directionalLight position={[-3, 2, -4]} intensity={0.4} />
        <Suspense fallback={null}>
          <MannequinModel selectedZone={selectedZone} onZoneClick={onZoneClick} />
        </Suspense>
        <MannequinCameraRig target={target} onArrive={() => setTarget(null)} />
        <OrbitControls
          makeDefault
          enablePan={false}
          minDistance={MIN_VIEW_DISTANCE}
          maxDistance={MAX_VIEW_DISTANCE}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={(Math.PI * 2) / 3}
        />
      </Canvas>

      <p className="absolute top-2 left-2 px-2 py-1 rounded-full bg-white/90 border border-zinc-200 text-xs text-zinc-500 backdrop-blur-sm">
        Widok: {MANNEQUIN_VIEWS[view].label}
      </p>

      <MannequinViewControls
        view={view}
        canZoomIn={distance > MIN_VIEW_DISTANCE}
        canZoomOut={distance < MAX_VIEW_DISTANCE}
        onSetView={(next) => moveTo(next, distance)}
        onZoomIn={() => zoomBy(-VIEW_DISTANCE_STEP)}
        onZoomOut={() => zoomBy(VIEW_DISTANCE_STEP)}
        onReset={() => moveTo('front', DEFAULT_VIEW_DISTANCE)}
      />
    </div>
  )
}
