'use client'

import dynamic from 'next/dynamic'
import { LoaderCircle } from 'lucide-react'
import type { BodyZone } from '@/types/diagnozyTypes'

const MannequinScene = dynamic(
  () => import('@/components/diagnozy/egzamin/mannequin/MannequinScene'),
  {
    ssr: false,
    loading: () => (
      <div className="h-125 rounded-card border border-surface-border bg-white flex items-center justify-center">
        <LoaderCircle className="w-6 h-6 animate-spin text-zinc-300" />
      </div>
    ),
  }
)

export default function WykonanieMannequinPanel({
  selectedZone,
  onAssign,
}: {
  selectedZone: BodyZone | null
  onAssign: (zone: BodyZone) => void
}) {
  return <MannequinScene selectedZone={selectedZone} onZoneClick={onAssign} />
}
