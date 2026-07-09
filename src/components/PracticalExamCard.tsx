import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Clock, FileText, Lock, User } from 'lucide-react'
import type { PublicExam } from '@/types/praktycznyTypes'
import {
  DEFAULT_PRACTICAL_EXAM_METADATA,
  PRACTICAL_EXAM_AI_CARD,
} from '@/constants/practicalExamCards'
import GenerateAIExamButton from '@/components/GenerateAIExamButton'

type Props =
  | { variant: 'exam'; exam: PublicExam }
  | { variant: 'ai'; isPremium?: boolean }

export default function PracticalExamCard(props: Props) {
  const isAI = props.variant === 'ai'
  const image = isAI ? PRACTICAL_EXAM_AI_CARD.image : DEFAULT_PRACTICAL_EXAM_METADATA.image
  const title = isAI ? PRACTICAL_EXAM_AI_CARD.title : props.exam.title

  const containerClass = `group relative flex flex-col lg:flex-row w-full rounded-2xl bg-slate-900 border ${
    isAI ? 'border-violet-500/20' : 'border-white/[0.06]'
  } opacity-95 hover:opacity-100 transition-all duration-300 overflow-hidden`

  const hero = (
    <div className="relative h-64 sm:h-72 lg:h-auto w-full lg:w-2/5 xl:w-1/3 shrink-0">
      <Image
        src={image}
        alt={title}
        fill
        sizes="(max-width: 1024px) 100vw, 40vw"
        className="object-cover transition-transform duration-500"
      />
      <div className="absolute inset-0 bg-linear-to-t from-slate-900/80 via-slate-900/10 to-transparent lg:bg-linear-to-r" />
    </div>
  )

  if (isAI) {
    const isPremium = props.isPremium ?? false
    return (
      <div className={containerClass}>
        {hero}
        <div className="flex flex-col gap-4 lg:gap-5 p-5 sm:p-6 lg:p-8 w-full">
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-violet-500/20 px-3 py-1 text-xs sm:text-sm text-violet-300 border border-violet-500/30 font-medium">
                {PRACTICAL_EXAM_AI_CARD.aiBadge}
              </span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-extrabold text-white drop-shadow-md leading-tight">
              {title}
            </h3>

            <p className="text-zinc-300 text-sm sm:text-base leading-relaxed">
              {PRACTICAL_EXAM_AI_CARD.description}
            </p>
          </div>

          <div className="mt-auto pt-1">
            {isPremium ? (
              <GenerateAIExamButton />
            ) : (
              <span className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-zinc-200 text-zinc-400 text-sm font-semibold rounded-lg border border-zinc-300 cursor-not-allowed w-full sm:w-auto">
                <Lock className="w-4 h-4" />
                {PRACTICAL_EXAM_AI_CARD.lockedLabel}
              </span>
            )}
          </div>
        </div>
      </div>
    )
  }

  const { exam } = props
  return (
    <Link href={`/panel/egzaminy/${exam.id}`} className={containerClass}>
      {hero}
      <div className="flex flex-col gap-4 lg:gap-5 p-5 sm:p-6 lg:p-8 w-full">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-green-500/20 px-3 py-1 text-xs sm:text-sm text-green-500 border border-green-500/30 font-medium">
              {DEFAULT_PRACTICAL_EXAM_METADATA.badge}
            </span>
            <span className="rounded-full bg-white/[0.06] px-3 py-1 text-xs sm:text-sm text-zinc-300 border border-white/10 font-medium">
              {exam.session}
            </span>
          </div>

          <h3 className="text-2xl sm:text-3xl font-extrabold text-white drop-shadow-md leading-tight">
            {title}
          </h3>

          <p className="text-xs font-mono text-zinc-400">{exam.arkusz}</p>

          <div className="flex items-start gap-2 text-sm text-zinc-300">
            <User className="w-4 h-4 mt-0.5 shrink-0 text-zinc-400" />
            <span>
              {exam.patient.name} — {exam.patient.ward}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-5">
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

        <div className="mt-auto pt-1">
          <span className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#f58a8a] group-hover:bg-[#ff5b5b] text-black text-sm font-semibold rounded-lg border border-red-200/40 group-hover:border-zinc-800 transition-colors w-full sm:w-auto">
            {DEFAULT_PRACTICAL_EXAM_METADATA.ctaLabel}
            <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  )
}
