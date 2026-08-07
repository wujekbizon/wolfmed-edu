'use client'

import { useActiveScene } from '@/hooks/useActiveScene'
import StorySceneCard from './StorySceneCard'
import type { StoryScene } from '@/types/pathStoryTypes'

// One scene at a time: the triggers below supply the scroll distance while the
// frame stays pinned, so scrolling swaps the scene instead of moving it.
export default function StorySceneTrack({ scenes }: { scenes: StoryScene[] }) {
  const { active, setTrigger } = useActiveScene(scenes.length)

  return (
    <div className="relative">
      <div aria-hidden>
        {scenes.map((scene, index) => (
          <div key={scene.time} ref={setTrigger(index)} className="h-[85vh]" />
        ))}
      </div>

      <div className="absolute inset-0">
        <div className="sticky top-24 h-[70vh] flex items-center">
          <div className="grid w-full">
            {scenes.map((scene, index) => (
              <div
                key={scene.time}
                aria-hidden={index !== active}
                className={`col-start-1 row-start-1 transition-all duration-500 ease-out motion-reduce:transition-none ${
                  index === active
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-3 pointer-events-none'
                }`}
              >
                <StorySceneCard
                  scene={scene}
                  index={index}
                  total={scenes.length}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
