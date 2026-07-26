'use client'

import { Suspense, useMemo, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import MannequinBody from '@/components/diagnozy/egzamin/mannequin/MannequinBody'
import MannequinStageLighting from '@/components/diagnozy/egzamin/mannequin/MannequinStageLighting'
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
import type { MannequinViewKey } from '@/types/mannequinTypes'

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
  const [debug, setDebug] = useState(false)

  // Recomputed only when a control is used, so the rig sees a new goal object
  // exactly once per request rather than on every render.
  const goal = useMemo(
    () => getMannequinCameraPosition(view, distance),
    [view, distance]
  )

  const clampDistance = (value: number) =>
    Math.min(MAX_VIEW_DISTANCE, Math.max(MIN_VIEW_DISTANCE, value))

  const zoomBy = (delta: number) => setDistance((prev) => clampDistance(prev + delta))

  return (
    <div
      className="relative h-105 rounded-xl border border-zinc-200 bg-gradient-to-b from-zinc-50 to-zinc-100 overflow-hidden"
      aria-label="Fantom pacjenta — kliknij część ciała"
    >
      <Canvas
        dpr={[1, 2]}
        gl={{ antialias: true }}
        camera={{ position: [0, 0.2, DEFAULT_VIEW_DISTANCE], fov: 45 }}
      >
        <Suspense fallback={null}>
          <MannequinStageLighting />
          <MannequinBody
            selectedZone={selectedZone}
            debug={debug}
            onZoneClick={onZoneClick}
          />
        </Suspense>
        <MannequinCameraRig goal={goal} onDistanceChange={setDistance} />
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

      {process.env.NODE_ENV === 'development' && (
        <button
          type="button"
          onClick={() => setDebug((shown) => !shown)}
          className="absolute top-10 left-2 px-2 py-1 rounded-full bg-white/90 border border-zinc-200 text-xs text-zinc-500 backdrop-blur-sm cursor-pointer hover:border-zinc-400"
        >
          {debug ? 'Ukryj strefy' : 'Pokaż strefy'}
        </button>
      )}

      <MannequinViewControls
        view={view}
        canZoomIn={distance > MIN_VIEW_DISTANCE}
        canZoomOut={distance < MAX_VIEW_DISTANCE}
        onSetView={setView}
        onZoomIn={() => zoomBy(-VIEW_DISTANCE_STEP)}
        onZoomOut={() => zoomBy(VIEW_DISTANCE_STEP)}
        onReset={() => {
          setView('front')
          setDistance(DEFAULT_VIEW_DISTANCE)
        }}
      />
    </div>
  )
}
