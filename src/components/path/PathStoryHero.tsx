import PathFacts from './PathFacts'
import StorySceneTrack from './StorySceneTrack'
import { PRICING_ANCHOR } from '@/constants/pricingAnchor'
import type { PathStory } from '@/types/pathStoryTypes'

// No overflow clipping anywhere down this tree: an ancestor with overflow
// hidden becomes the sticky column's scroll container and pins it to nothing.
export default function PathStoryHero({
  title,
  story,
}: {
  title: string
  story: PathStory
}) {
  return (
    <section className="w-full bg-gradient-to-br from-rose-50 to-rose-100/60">
      <div className="mx-auto max-w-[1440px] grid grid-cols-1 lg:grid-cols-[440px_1fr] items-start">
        <aside className="lg:sticky lg:top-0 lg:h-screen flex flex-col justify-between gap-12 bg-gradient-to-br from-rose-50/90 to-rose-100/50 px-6 py-12 sm:px-10 lg:px-11 lg:py-16">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.06em] text-zinc-700 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-[#f65555]" />
              Kierunek Edukacyjny
            </span>

            <h1 className="mt-6 text-[38px] lg:text-[52px] font-bold leading-[1.04] tracking-[-0.025em] text-slate-900">
              {title}
            </h1>

            <p className="mt-5 max-w-[330px] text-base leading-[1.65] text-zinc-600 text-pretty">
              {story.intro}
            </p>
          </div>

          <div>
            <PathFacts facts={story.facts} />

            <a
              href={`#${PRICING_ANCHOR}`}
              className="group mt-8 inline-flex items-center gap-2 text-sm font-medium text-[#f65555] transition-colors hover:text-[#d93b3b]"
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
    </section>
  )
}
