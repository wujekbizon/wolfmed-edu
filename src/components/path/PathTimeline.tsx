'use client'

import { useHorizontalPath } from '@/hooks/useHorizontalPath'
import { useSceneReveal } from '@/hooks/useSceneReveal'
import PathStepCard from './PathStepCard'
import type { CareerPath } from '@/types/pathStoryTypes'

export default function PathTimeline({ path }: { path: CareerPath }) {
  const { section, viewport, track, percent, near, height, pinned } =
    useHorizontalPath(path.steps.length)
  const { active, setScene } = useSceneReveal(path.steps.length)

  return (
    <section
      ref={section}
      aria-labelledby='path-title'
      className='relative w-full h-auto px-4 pb-4 sm:px-6 sm:pb-6 md:px-8 md:pb-8 lg:px-12 lg:pb-12'
      style={height ? { height } : undefined}
    >
      <div className='xl:sticky xl:top-24 mx-auto flex w-full max-w-[1600px] flex-col overflow-hidden rounded-3xl bg-white ring-1 ring-zinc-900/5 xl:max-h-[calc(100vh-7rem)]'>
        <header className='flex-none px-6 pt-8 sm:px-10 lg:px-12 lg:pt-9'>
          <p className='font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-rose-500'>
            Ścieżka zawodowa
          </p>

          <div className='mt-3.5 flex items-end justify-between gap-10'>
            <h2
              id='path-title'
              className='max-w-[620px] text-3xl lg:text-[38px] font-bold leading-[1.05] tracking-[-0.03em] text-slate-900'
            >
              {path.headline}
            </h2>
            <div className='hidden xl:block flex-none text-right'>
              <b className='block text-[34px] font-bold leading-none text-slate-900 tabular-nums'>
                {percent}%
              </b>
              <span className='mt-1.5 block font-mono text-[10.5px] font-medium uppercase text-zinc-400'>
                Ścieżki
              </span>
            </div>
          </div>

          <div className='mt-6 h-[3px] rounded-full bg-zinc-900/10'>
            <div
              className='h-[3px] rounded-full bg-rose-500 transition-[width] duration-150 ease-out'
              style={{ width: `${percent}%` }}
            />
          </div>
        </header>

        <div ref={viewport} className='flex-1 py-6 xl:overflow-hidden xl:[@media(max-height:859px)]:py-2'>
          <div
            ref={track}
            className='flex flex-col gap-6 px-6 sm:px-10 lg:px-12 xl:w-max xl:flex-row xl:will-change-transform'
          >
            {path.steps.map((step, index) => (
              <PathStepCard
                key={step.step}
                step={step}
                ref={setScene(index)}
                near={(pinned ? near[index] : active[index]) ?? false}
              />
            ))}
          </div>
        </div>

        <footer className='flex-none px-6 pb-10 pt-8 text-center sm:px-10 lg:px-12 lg:pb-8 lg:pt-6'>
          <small className='text-[13px] leading-[1.5] text-zinc-400'>
            Przewiń, aby zobaczyć całą ścieżkę
          </small>
        </footer>
      </div>
    </section>
  )
}
