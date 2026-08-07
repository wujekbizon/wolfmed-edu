'use client'

import { useHorizontalPath } from '@/hooks/useHorizontalPath'
import PathStepCard from './PathStepCard'
import { PATH_SCROLL_HEIGHT } from '@/constants/careerPath'
import { PRICING_ANCHOR } from '@/constants/pricingAnchor'
import type { CareerPath } from '@/types/pathStoryTypes'

// The section's height is the scroll budget; the stage inside it is what you
// actually see. overflow-hidden lives on the viewport, never on an ancestor of
// the sticky stage — that would stop it sticking at all.
export default function PathTimeline({ path }: { path: CareerPath }) {
  const { section, viewport, track, percent, near } = useHorizontalPath(path.steps.length)

  return (
    <section
      ref={section}
      aria-labelledby="path-title"
      className="relative w-full h-auto px-4 pb-4 sm:px-6 sm:pb-6 md:px-8 md:pb-8 lg:h-[var(--path-height)] lg:px-12 lg:pb-12"
      style={{ '--path-height': PATH_SCROLL_HEIGHT } as React.CSSProperties}
    >
      {/* Capped width on purpose: the track only travels by however much it
          overflows the viewport, so a full-bleed stage that already fits every
          card leaves the progress bar counting against no movement at all. */}
      <div className="lg:sticky lg:top-24 mx-auto flex w-full max-w-6xl flex-col overflow-hidden rounded-3xl bg-white ring-1 ring-zinc-900/5 lg:h-[60vh] lg:min-h-[580px]">
        <header className="flex-none px-6 pt-8 sm:px-10 lg:px-12 lg:pt-9">
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-rose-500">
            Ścieżka zawodowa
          </p>

          <div className="mt-3.5 flex items-end justify-between gap-10">
            <h2
              id="path-title"
              className="max-w-[620px] text-3xl lg:text-[38px] font-bold leading-[1.05] tracking-[-0.03em] text-slate-900"
            >
              {path.headline}
            </h2>
            <div className="hidden lg:block flex-none text-right">
              <b className="block text-[34px] font-bold leading-none text-slate-900 tabular-nums">
                {percent}%
              </b>
              <span className="mt-1.5 block font-mono text-[10.5px] font-medium uppercase text-zinc-400">
                Ścieżki
              </span>
            </div>
          </div>

          <div className="mt-6 h-[3px] rounded-full bg-zinc-900/10">
            <div
              className="h-[3px] rounded-full bg-rose-500 transition-[width] duration-150 ease-out"
              style={{ width: `${percent}%` }}
            />
          </div>
        </header>

        <div ref={viewport} className="flex-1 pt-6 lg:overflow-hidden">
          <div
            ref={track}
            className="flex flex-col gap-6 px-6 sm:px-10 lg:w-max lg:flex-row lg:px-12 lg:will-change-transform"
          >
            {path.steps.map((step, index) => (
              <PathStepCard key={step.step} step={step} near={near[index] ?? false} />
            ))}
          </div>
        </div>

        <footer className="flex-none flex flex-col items-start gap-4 px-6 pb-10 pt-8 sm:px-10 lg:flex-row lg:items-center lg:px-12 lg:pb-8 lg:pt-6">
          <a
            href={`#${PRICING_ANCHOR}`}
            className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
          >
            Zacznij od darmowego testu
          </a>
          <small className="text-[13px] leading-[1.5] text-zinc-400">
            Przewiń, aby zobaczyć całą ścieżkę
          </small>
        </footer>
      </div>
    </section>
  )
}
