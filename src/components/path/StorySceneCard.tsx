import Image from 'next/image'
import type { StoryScene } from '@/types/pathStoryTypes'

export default function StorySceneCard({
  scene,
  index,
  total,
  headingId
}: {
  scene: StoryScene
  index: number
  total: number
  headingId: string
}) {
  return (
    <div className='flex flex-col gap-4'>
      <p className='flex items-center gap-4'>
        <time
          dateTime={scene.time}
          className='text-xs font-mono font-medium text-rose-500 tabular-nums'
        >
          {scene.time}
        </time>
        <span aria-hidden='true' className='h-px flex-1 bg-zinc-900/10' />
        <span className='text-[11px] uppercase tracking-widest text-zinc-400'>
          Scena {index + 1} z {total}
        </span>
      </p>

      <figure className='relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-zinc-50 ring-1 ring-zinc-900/5 xl:max-h-[52vh]'>
        {scene.imgSrc ? (
          <Image
            src={scene.imgSrc}
            alt={scene.photoHint}
            fill
            sizes='(max-width: 1279px) calc(100vw - 5rem), 60vw'
            priority={index === 0}
            className='object-cover'
          />
        ) : (
          // Only stands in when there is no image yet. With one, the hint is
          // the alt text and repeating it on screen would just be noise.
          <figcaption className='absolute inset-0 flex items-center justify-center p-6 text-center font-mono text-[11px] leading-[1.5] text-zinc-400'>
            [ foto: {scene.photoHint} ]
          </figcaption>
        )}
      </figure>

      <div>
        <h3
          id={headingId}
          className='text-xl md:text-2xl font-bold text-slate-900 leading-snug'
        >
          {scene.title}
        </h3>
        <p className='mt-2 text-zinc-600 text-sm md:text-base leading-relaxed text-pretty'>
          {scene.description}
        </p>
      </div>
    </div>
  )
}
