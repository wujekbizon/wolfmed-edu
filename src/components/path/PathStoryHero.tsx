import PathFacts from './PathFacts'
import LinkButton from '@/components/ui/LinkButton'
import StorySceneTrack from './StorySceneTrack'
import { PRICING_ANCHOR } from '@/constants/pricingAnchor'
import type { PathStory } from '@/types/pathStoryTypes'

export default function PathStoryHero({
  title,
  story
}: {
  title: string
  story: PathStory
}) {
  return (
    <div className='w-full p-4 sm:p-6 md:p-8 lg:p-12'>
      <div className='relative w-full rounded-3xl bg-white ring-1 ring-zinc-900/5'>
        <div className='grid grid-cols-1 lg:grid-cols-[2fr_3fr]'>
          <aside className='flex flex-col gap-8 p-6 sm:p-10 lg:sticky lg:top-24 lg:h-[90vh] lg:justify-around lg:p-14'>
            <div>
              <span className='inline-flex items-center gap-2 self-start rounded-full bg-white/80 backdrop-blur-sm border border-zinc-200/60 shadow-sm px-3 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-zinc-600'>
                <span className='w-1.5 h-1.5 rounded-full bg-rose-400' />
                Kierunek Edukacyjny
              </span>

              <h1 className='mt-6 text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 leading-[1.05] tracking-tight'>
                {title}
              </h1>

              <p className='mt-5 max-w-md text-zinc-600 text-base sm:text-lg leading-relaxed text-pretty'>
                {story.intro}
              </p>
            </div>

            <PathFacts facts={story.facts} />

            <div className='flex flex-col items-start gap-4'>
              <LinkButton href={`#${PRICING_ANCHOR}`} size='lg'>
                Uzyskaj dostęp do kursu
              </LinkButton>

              <a
                href={`#${PRICING_ANCHOR}`}
                className='group inline-flex items-center gap-2 text-sm font-medium text-rose-600 hover:text-rose-700 transition-colors'
              >
                Zobacz plany i ceny
                <span className='transition-transform duration-200 group-hover:translate-y-0.5'>
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
