'use client'

import { useSceneReveal } from '@/hooks/useSceneReveal'
import StorySceneCard from './StorySceneCard'
import type { StoryScene } from '@/types/pathStoryTypes'

export default function StorySceneTrack({ scenes }: { scenes: StoryScene[] }) {
  const { active, setScene } = useSceneReveal(scenes.length)

  return (
    <ol className='px-6 pb-6 sm:px-10 sm:pb-10 lg:pl-0 lg:pr-14 lg:pb-0'>
      {scenes.map((scene, index) => {
        const headingId = `scene-${index + 1}-title`

        return (
          <li
            key={scene.time}
            ref={setScene(index)}
            className='flex flex-col justify-center py-10 lg:py-0 lg:h-[90vh]'
          >
            <article
              aria-labelledby={headingId}
              className='scene-reveal'
              data-active={active[index] ? 'true' : 'false'}
            >
              <StorySceneCard
                scene={scene}
                index={index}
                total={scenes.length}
                headingId={headingId}
              />
            </article>
          </li>
        )
      })}
    </ol>
  )
}
