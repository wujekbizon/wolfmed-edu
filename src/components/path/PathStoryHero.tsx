import PathFacts from './PathFacts'
import StorySceneTrack from './StorySceneTrack'
import { PRICING_ANCHOR } from '@/constants/pricingAnchor'
import type { PathStory } from '@/types/pathStoryTypes'

// Deliberately no overflow-hidden on the card: an ancestor that clips becomes
// the sticky column's scroll container and pins it to nothing. Rounded corners
// hold without it — every child sits inside the padding.
export default function PathStoryHero({
  title,
  story,
}: {
  title: string
  story: PathStory
}) {
  return (
    <div className="w-full bg-white p-4 sm:p-6 md:p-8 lg:p-12">
      <div className="relative w-full rounded-3xl bg-gradient-to-br from-rose-50/80 via-white to-rose-50/50 ring-1 ring-zinc-900/5">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,440px)_1fr] items-start">
          <aside className="flex flex-col gap-12 p-6 sm:p-10 lg:sticky lg:top-0 lg:h-screen lg:justify-between lg:p-14">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/80 backdrop-blur-sm border border-zinc-200/60 shadow-sm px-3 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-zinc-600">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                Kierunek Edukacyjny
              </span>

              <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 leading-[1.05] tracking-tight">
                {title}
              </h1>

              <p className="mt-5 max-w-md text-zinc-600 text-base sm:text-lg leading-relaxed text-pretty">
                {story.intro}
              </p>
            </div>

            <div>
              <PathFacts facts={story.facts} />

              <a
                href={`#${PRICING_ANCHOR}`}
                className="group mt-8 inline-flex items-center gap-2 text-sm font-medium text-rose-600 hover:text-rose-700 transition-colors"
              >
                Zobacz program nauczania
                <span className="transition-transform duration-200 group-hover:translate-y-0.5">
                  ↓
                </span>
              </a>
            </div>
          </aside>

          <StorySceneTrack scenes={story.scenes} />
        </div>
      </div>
    </div>
  )
}
