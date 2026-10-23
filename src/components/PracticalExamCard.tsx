import Link from 'next/link'
import { ArrowRight, Clock, FileText, User } from 'lucide-react'
import PracticalExamHero from '@/components/PracticalExamHero'
import PracticalExamAICard from '@/components/PracticalExamAICard'
import { DEFAULT_PRACTICAL_EXAM_METADATA } from '@/constants/practicalExamCards'
import { BUTTON_BASE, BUTTON_SHAPES, BUTTON_VARIANTS } from '@/constants/buttonStyles'
import type { PracticalExamCardProps } from '@/types/practicalExamCardTypes'

export default function PracticalExamCard(props: PracticalExamCardProps) {
  if (props.variant === 'ai') return <PracticalExamAICard isPremium={props.isPremium} action={props.action} />
  const { exam } = props
  return (
    <Link href={`/panel/egzaminy/${exam.id}`} className="group relative flex w-full min-w-0 flex-col overflow-hidden rounded-2xl border border-white/[0.06] bg-slate-900 lg:flex-row">
      <PracticalExamHero image={DEFAULT_PRACTICAL_EXAM_METADATA.image} title={exam.title} eager />
      <div className="flex flex-col min-w-0 w-full gap-4 p-4 sm:gap-5 sm:p-5 lg:gap-6 lg:p-6 xl:p-8">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-green-500/20 px-3 py-1 text-xs sm:text-sm text-green-500 border border-green-500/30 font-medium">
              {DEFAULT_PRACTICAL_EXAM_METADATA.badge}
            </span>
            <span className="rounded-full bg-white/[0.06] px-3 py-1 text-xs sm:text-sm text-zinc-300 border border-white/10 font-medium">
              {exam.session}
            </span>
          </div>

          <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white drop-shadow-md leading-tight">
            {exam.title}
          </h3>

          <p className="text-xs font-mono text-zinc-400">{exam.arkusz}</p>

          <div className="flex items-start gap-2 text-sm text-zinc-300">
            <User className="w-4 h-4 mt-0.5 shrink-0 text-zinc-400" />
            <span>
              {exam.patient.name} — {exam.patient.ward}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
          <span className="inline-flex items-center gap-1.5 text-sm text-zinc-200">
            <Clock className="w-4 h-4 text-red-300" />
            <span className="font-bold text-red-300">{exam.durationMinutes}</span> min
          </span>
          <span className="inline-flex items-center gap-1.5 text-sm text-zinc-200">
            <FileText className="w-4 h-4 text-red-300" />
            <span className="font-bold text-red-300">{exam.forms.length}</span>{' '}
            {exam.forms.length === 1 ? 'karta' : 'karty'} do uzupełnienia
          </span>
        </div>

        <div className="mt-auto rounded-lg border border-zinc-600 bg-slate-950 p-3 sm:p-4">
          <span className={[BUTTON_BASE, BUTTON_SHAPES.rounded, BUTTON_VARIANTS.primary, 'min-h-11 w-full px-4 py-2 text-sm whitespace-normal'].join(' ')}>
            {DEFAULT_PRACTICAL_EXAM_METADATA.ctaLabel}
            <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  )
}
