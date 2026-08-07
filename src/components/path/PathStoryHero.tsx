import PathFacts from './PathFacts'
import StorySceneCard from './StorySceneCard'
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
    <div className="relative w-full overflow-hidden rounded-3xl bg-gradient-to-br from-rose-50/80 via-white to-rose-50/50 ring-1 ring-zinc-900/5">
      <div className="grid grid-cols-1 lg:grid-cols-2">
        <div className="lg:sticky lg:top-24 lg:self-start p-6 sm:p-10 lg:p-14 flex flex-col gap-6">
          <span className="inline-flex items-center gap-2 self-start rounded-full bg-white/80 backdrop-blur-sm border border-zinc-200/60 shadow-sm px-3 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-zinc-600">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            Kierunek Edukacyjny
          </span>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 leading-[1.05] tracking-tight">
            {title}
          </h1>

          <p className="max-w-md text-zinc-600 text-base sm:text-lg leading-relaxed">
            {story.intro}
          </p>

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

        <div className="p-6 sm:p-10 lg:p-14 lg:pl-0 flex flex-col gap-14">
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
