'use client'

import { useSceneReveal } from '@/hooks/useSceneReveal'
import StorySceneCard from './StorySceneCard'
import type { StoryScene } from '@/types/pathStoryTypes'

// Scenes sit in the page's own scroll, one viewport tall each, so the sticky
// column beside them has something to stay put against. No inner scroller —
// that would take the wheel away from the page.
export default function StorySceneTrack({ scenes }: { scenes: StoryScene[] }) {
  const { active, setScene } = useSceneReveal(scenes.length)

  return (
    <div className="px-6 pb-6 sm:px-10 sm:pb-10 lg:pl-0 lg:pr-14 lg:pb-0">
      {scenes.map((scene, index) => (
        <article
          key={scene.time}
          ref={setScene(index)}
          className="flex flex-col justify-center py-10 lg:py-0 lg:h-[90vh]"
        >
          <div className="scene-reveal" data-active={active[index] ? 'true' : 'false'}>
            <StorySceneCard scene={scene} index={index} total={scenes.length} />
          </div>
        </article>
      ))}
    </div>
  )
}
