'use client'

import { usePathname } from 'next/navigation'
import CompletedTestsListSkeleton from './CompletedTestsListSkeleton'

export default function PanelLayoutLoadingContent() {
  const pathname = usePathname()
  return <div id="scroll-container" className="min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain scrollbar-webkit">
    <div className="py-10">
      {pathname === '/panel/wyniki' ? <CompletedTestsListSkeleton /> : (
        <div className="grid gap-5 px-3" role="status" aria-label="Wczytywanie panelu">
          <div className="mx-auto h-10 w-full max-w-6xl animate-pulse rounded-xl bg-zinc-200/50" />
          <div className="mx-auto h-32 w-full max-w-6xl animate-pulse rounded-2xl border border-white bg-white/60" />
          <div className="mx-auto grid w-full max-w-6xl animate-pulse gap-5 md:grid-cols-2">
            <div className="h-44 rounded-2xl border border-white bg-white/60" />
            <div className="h-44 rounded-2xl border border-white bg-white/60" />
          </div>
        </div>
      )}
    </div>
  </div>
}
