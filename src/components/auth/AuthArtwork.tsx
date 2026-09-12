'use client'

import dynamic from 'next/dynamic'
import AuthCellIllustration from './AuthCellIllustration'
import AuthSceneBoundary from './AuthSceneBoundary'
import { useAuthSceneEnabled } from '@/hooks/useAuthSceneEnabled'

const AuthCellScene = dynamic(() => import('./AuthCellScene'), {
  ssr: false,
  loading: () => <AuthCellIllustration />,
})

export default function AuthArtwork() {
  const { enabled, visible } = useAuthSceneEnabled()

  return (
    <aside
      className="auth-artwork-surface relative min-h-160 overflow-hidden rounded-[25px] [clip-path:polygon(0_0,100%_0,95%_100%,0_100%)] max-md:h-56 max-md:min-h-56 max-md:rounded-[20px] max-md:[clip-path:none]"
      aria-label="Edukacja medyczna"
    >
      <div className="absolute inset-0 max-md:-top-1/5 max-md:-right-[5%] max-md:-bottom-[45%] max-md:left-[36%]" aria-hidden>
        {enabled ? (
          <AuthSceneBoundary>
            <AuthCellScene paused={!visible} />
          </AuthSceneBoundary>
        ) : <AuthCellIllustration />}
      </div>
      <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-[#28161f] via-transparent to-transparent" aria-hidden />
      <div className="pointer-events-none relative flex h-full flex-col p-6 sm:p-8 lg:p-10">
        <div className="flex items-center gap-2 text-[10px] font-semibold tracking-[0.2em] text-[#f6c5bd]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#ff8a7d]" />
          Platforma edukacyjna
        </div>
        <div className="relative mt-auto max-w-sm pt-20 max-md:pt-4 md:pt-80">
          <p className="text-3xl font-semibold leading-[1.12] tracking-[-0.05em] text-[#fff6f2] max-md:text-2xl sm:text-4xl lg:text-5xl">
            Od teorii<br />do praktyki.
          </p>
          <p className="mt-4 max-w-[260px] text-xs leading-relaxed text-[#e3c5c4] sm:text-sm">
            Testy, procedury i materiały do nauki. Wszystko w jednym miejscu.
          </p>
        </div>
      </div>
    </aside>
  )
}
