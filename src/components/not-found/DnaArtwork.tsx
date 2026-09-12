'use client'

import dynamic from 'next/dynamic'
import { useAuthSceneEnabled } from '@/hooks/useAuthSceneEnabled'
import DnaIllustration from './DnaIllustration'

const DnaScene = dynamic(() => import('./DnaScene'), {
  ssr: false,
  loading: () => <DnaIllustration />,
})

export default function DnaArtwork() {
  const { enabled, visible } = useAuthSceneEnabled()

  return (
    <div className="relative isolate h-64 overflow-hidden rounded-[24px] bg-[radial-gradient(ellipse_at_20%_0%,#9f6650aa,transparent_60%),radial-gradient(ellipse_at_100%_80%,#863c4b80,transparent_60%)] bg-[#351d29] sm:h-80 md:h-full md:min-h-[596px] xl:min-h-[656px]" aria-hidden>
      <div className="absolute inset-0">
        {enabled ? <DnaScene paused={!visible} /> : <DnaIllustration />}
      </div>
      <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-[#28161f]/80 via-transparent to-transparent" />
      <div className="absolute inset-x-7 top-7 flex items-center gap-2 text-[10px] font-semibold tracking-[0.2em] text-[#f6c5bd] sm:inset-x-9 sm:top-9">
        <span className="h-1.5 w-1.5 rounded-full bg-[#ff8a7d]" />
        WOLFMED EDUKACJA
      </div>
      <div className="absolute inset-x-7 bottom-7 flex items-center justify-between border-t border-[#f6c5bd]/15 pt-4 text-[10px] tracking-[0.12em] text-[#e3c5c4] sm:inset-x-9 sm:bottom-9">
        <span>POŁĄCZENIE PRZERWANE</span>
        <span className="font-mono opacity-60">— · —</span>
      </div>
    </div>
  )
}
