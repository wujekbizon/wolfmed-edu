import PathFacts from './PathFacts'
import StorySceneCard from './StorySceneCard'
import StorySceneTrack from './StorySceneTrack'
import { PRICING_ANCHOR } from '@/constants/pricingAnchor'
import type { PathStory } from '@/types/pathStoryTypes'

export default function PathStoryHero({
  title,
  story,
}: {
  title: string
  story: PathStory
}) {
  return (
    <div className="relative w-full overflow-hidden rounded-3xl bg-gradient-to-br from-rose-50/80 via-white to-rose-50/50 ring-1 ring-zinc-900/5 lg:h-[calc(100vh-8rem)] lg:max-h-[880px]">
      <div className="grid grid-cols-1 lg:grid-cols-2 lg:h-full">
        <div className="flex flex-col p-6 sm:p-10 lg:p-14 lg:h-full">
          <span className="inline-flex items-center gap-2 self-start rounded-full bg-white/80 backdrop-blur-sm border border-zinc-200/60 shadow-sm px-3 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-zinc-600">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            Kierunek Edukacyjny
          </span>

          <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 leading-[1.05] tracking-tight">
            {title}
          </h1>

          <p className="mt-5 max-w-md text-zinc-600 text-base sm:text-lg leading-relaxed">
            {story.intro}
          </p>

          <div className="mt-10 lg:mt-auto lg:pt-10 flex flex-col gap-6">
            <PathFacts facts={story.facts} />

            <a
              href={`#${PRICING_ANCHOR}`}
              className="group inline-flex items-center gap-2 self-start text-sm font-medium text-rose-600 hover:text-rose-700 transition-colors"
            >
              Zobacz program nauczania
              <span className="transition-transform duration-200 group-hover:translate-y-0.5">
                ↓
              </span>
            </a>
          </div>
        </div>

        <div className="hidden lg:block h-full min-h-0 pr-14">
          <StorySceneTrack scenes={story.scenes} />
        </div>

        <div className="lg:hidden p-6 sm:p-10 pt-0 flex flex-col gap-14">
          {story.scenes.map((scene, index) => (
            <StorySceneCard
              key={scene.time}
              scene={scene}
              index={index}
              total={story.scenes.length}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
