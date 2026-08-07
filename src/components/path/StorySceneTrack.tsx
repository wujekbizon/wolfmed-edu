'use client'

import { useRef } from 'react'
import { useActiveScene } from '@/hooks/useActiveScene'
import StorySceneCard from './StorySceneCard'
import type { StoryScene } from '@/types/pathStoryTypes'

// One scene fills the frame at a time. Scroll snapping does the sequencing;
// the active index only drives the fade, so the track still works if the
// observer never fires.
export default function StorySceneTrack({ scenes }: { scenes: StoryScene[] }) {
  const frame = useRef<HTMLDivElement>(null)
  const { active, setScene } = useActiveScene(scenes.length, frame)

  return (
    <div
      ref={frame}
      className="h-full overflow-y-auto snap-y snap-mandatory scrollbar-thin overscroll-contain"
    >
      {scenes.map((scene, index) => (
        <div
          key={scene.time}
          ref={setScene(index)}
          className="h-full snap-start flex items-center py-8"
        >
          <div
            className={`w-full transition-all duration-500 ease-out motion-reduce:transition-none ${
              index === active ? 'opacity-100 translate-y-0' : 'opacity-30 translate-y-2'
            }`}
          >
            <StorySceneCard scene={scene} index={index} total={scenes.length} />
          </div>
        </div>
      ))}
    </div>
  )
}
