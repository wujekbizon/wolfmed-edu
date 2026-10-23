import { Lock, Wand2 } from 'lucide-react'
import Button from '@/components/ui/Button'
import PracticalExamHero from '@/components/PracticalExamHero'
import { PRACTICAL_EXAM_AI_CARD } from '@/constants/practicalExamCards'
import type { PracticalExamAICardProps } from '@/types/practicalExamCardTypes'

export default function PracticalExamAICard({ isPremium = false, action }: PracticalExamAICardProps) {
    return (
      <div className='relative flex w-full min-w-0 flex-col overflow-hidden rounded-2xl border border-violet-500/20 bg-slate-900 lg:flex-row'>
        <PracticalExamHero image={PRACTICAL_EXAM_AI_CARD.image} title={PRACTICAL_EXAM_AI_CARD.title} />
        <div className="flex flex-col min-w-0 w-full gap-4 p-4 sm:gap-5 sm:p-5 lg:gap-6 lg:p-6 xl:p-8">
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-violet-500/20 px-3 py-1 text-xs sm:text-sm text-violet-300 border border-violet-500/30 font-medium">
                {PRACTICAL_EXAM_AI_CARD.aiBadge}
              </span>
            </div>

            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white drop-shadow-md leading-tight">
              {PRACTICAL_EXAM_AI_CARD.title}
            </h3>

            <p className="text-zinc-300 text-sm sm:text-base leading-relaxed">
              {PRACTICAL_EXAM_AI_CARD.description}
            </p>
          </div>

          <div className="mt-auto rounded-lg border border-zinc-600 bg-slate-950 p-3 sm:p-4">
            {isPremium && action ? (
              <form action={action}>
                <Button type="submit" variant="accent" className="min-h-11 w-full whitespace-normal">
                  <Wand2 className="w-4 h-4" />
                  {PRACTICAL_EXAM_AI_CARD.ctaLabel}
                </Button>
              </form>
            ) : (
              <Button disabled variant="secondary" className="min-h-11 w-full whitespace-normal">
                <Lock className="w-4 h-4" />
                {PRACTICAL_EXAM_AI_CARD.lockedLabel}
              </Button>
            )}
          </div>
        </div>
      </div>
    )
}
