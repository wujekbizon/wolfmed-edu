'use client'

import { useRef } from 'react'
import { useSceneFocus } from '@/hooks/useSceneFocus'
import StorySceneCard from './StorySceneCard'
import type { StoryScene } from '@/types/pathStoryTypes'

// Scroll snapping sequences the scenes; focus only shapes the fade, so the
// track still reads one-at-a-time if the measurement never runs.
export default function StorySceneTrack({ scenes }: { scenes: StoryScene[] }) {
  const frame = useRef<HTMLDivElement>(null)
  const { focus, setScene } = useSceneFocus(scenes.length, frame)

  return (
    <div
      ref={frame}
      className="h-full overflow-y-auto snap-y snap-mandatory scrollbar-hidden overscroll-contain"
    >
      {scenes.map((scene, index) => {
        const value = focus[index] ?? 0

        return (
          <div
            key={scene.time}
            ref={setScene(index)}
            className="h-full snap-start flex items-center py-8"
          >
            <div
              className="w-full will-change-[opacity,transform]"
              style={{
                opacity: 0.08 + 0.92 * value ** 1.6,
                transform: `translate3d(0, ${(1 - value) * 18}px, 0)`,
              }}
            >
              <StorySceneCard scene={scene} index={index} total={scenes.length} />
            </div>
          </div>
        )
      })}
    </div>
  )
}
