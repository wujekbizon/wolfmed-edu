import Image from 'next/image'
import type { PathStep } from '@/types/pathStoryTypes'

export default function PathStepCard({
  step,
  near,
  ref
}: {
  step: PathStep
  near: boolean
  ref?: (node: HTMLElement | null) => void
}) {
  return (
    <article
      ref={ref}
      className={`w-full xl:w-[clamp(340px,30vw,560px)] xl:flex-none overflow-hidden rounded-2xl bg-white border border-zinc-900/[0.06] shadow-[0_6px_22px_rgba(25,26,28,0.07)] transition-all duration-[400ms] ease-out motion-reduce:transition-none ${
        near
          ? 'opacity-100 translate-y-0 xl:my-0'
          : 'opacity-45 translate-y-3 xl:my-6'
      }`}
    >
      <div
        className={`relative aspect-[16/9] max-h-[280px] w-full transition-[height] duration-[400ms] ease-out motion-reduce:transition-none xl:aspect-auto ${
          near
            ? 'xl:h-[160px] xl:[@media(min-height:860px)]:h-[240px]'
            : 'xl:h-[160px] xl:[@media(min-height:860px)]:h-[200px]'
        }`}
      >
        {step.imgSrc ? (
          <Image
            src={step.imgSrc}
            alt={step.photoHint}
            fill
            sizes='(max-width: 1279px) calc(100vw - 5rem), 30vw'
            className='object-cover'
          />
        ) : (
          <span className='absolute bottom-3.5 left-3.5 rounded-md bg-white/85 px-2.5 py-1 font-mono text-[10.5px] leading-[1.4] text-zinc-600'>
            [ foto: {step.photoHint} ]
          </span>
        )}
      </div>

      <div className='px-6 pb-6 pt-5'>
        <div className='flex items-center gap-2.5 font-mono text-[10.5px] font-medium uppercase'>
          <span className='text-rose-500'>{step.step}</span>
          <span className='text-zinc-400 normal-case'>{step.duration}</span>
        </div>
        <h3 className='mt-3 text-xl font-semibold leading-[1.25] tracking-[-0.015em] text-slate-900'>
          {step.title}
        </h3>
        <p className='mt-2 text-[13.5px] leading-[1.6] text-zinc-600 text-pretty'>
          {step.description}
        </p>
      </div>
    </article>
  )
}
