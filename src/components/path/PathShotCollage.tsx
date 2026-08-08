'use client'

import Image from 'next/image'
import { useSceneReveal } from '@/hooks/useSceneReveal'
import { PATH_SHOT_HEIGHTS } from '@/constants/pathShotHeights'
import type { PathShot } from '@/types/pathStoryTypes'

export default function PathShotCollage({ shots }: { shots: PathShot[] }) {
  const { active, setScene } = useSceneReveal(shots.length, true)

  return (
    <ul className='flex flex-col gap-5 px-6 pb-10 sm:px-10 lg:px-12 xl:py-14 xl:pl-6 xl:pr-14'>
      {shots.map((shot, index) => (
        <li
          key={shot.photoHint}
          ref={setScene(index)}
          className='scene-reveal'
          data-active={active[index] ? 'true' : 'false'}
        >
          <figure
            className={`relative flex items-end overflow-hidden rounded-xl bg-gradient-to-br from-[#e4f3ee] to-[#e7ddf7] p-4 ${
              PATH_SHOT_HEIGHTS[index % PATH_SHOT_HEIGHTS.length]
            }`}
          >
            {shot.imgSrc ? (
              <Image
                src={shot.imgSrc}
                alt={shot.photoHint}
                fill
                sizes='(max-width: 1279px) calc(100vw - 5rem), 45vw'
                className='object-cover'
              />
            ) : (
              <figcaption className='relative rounded-md bg-white/85 px-2.5 py-1.5 font-mono text-[11px] leading-tight text-zinc-700'>
                [ foto: {shot.photoHint} ]
              </figcaption>
            )}
          </figure>
        </li>
      ))}
    </ul>
  )
}
