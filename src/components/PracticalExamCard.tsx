import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Clock, FileText, Stethoscope, User } from 'lucide-react'
import type { PublicExam } from '@/types/praktycznyTypes'

interface Props {
  exam: PublicExam
}

export default function PracticalExamCard({ exam }: Props) {
  return (
    <Link
      href={`/panel/egzaminy/${exam.id}`}
      className="group relative flex flex-col lg:flex-row w-full rounded-2xl bg-slate-900 border border-white/[0.06] opacity-95 hover:opacity-100 transition-all duration-300 overflow-hidden"
    >
      <div className="relative h-56 sm:h-64 lg:h-auto w-full lg:w-2/5 xl:w-1/3 shrink-0">
        {exam.image ? (
          <Image
            src={exam.image}
            alt={exam.title}
            fill
            sizes="(max-width: 1024px) 100vw, 40vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex items-center justify-center h-full w-full bg-linear-to-br from-slate-700 to-slate-900">
            <Stethoscope className="w-16 h-16 text-white/70" />
          </div>
        )}
        <div className="absolute inset-0 bg-linear-to-t from-slate-900/80 via-slate-900/10 to-transparent lg:bg-linear-to-r" />
      </div>

      <div className="flex flex-col gap-4 lg:gap-5 p-5 sm:p-6 lg:p-8 w-full">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-green-500/20 px-3 py-1 text-xs sm:text-sm text-green-500 border border-green-500/30 font-medium">
              Część praktyczna · MED.14
            </span>
            <span className="rounded-full bg-white/[0.06] px-3 py-1 text-xs sm:text-sm text-zinc-300 border border-white/10 font-medium">
              {exam.session}
            </span>
          </div>

          <h3 className="text-2xl sm:text-3xl font-extrabold text-white drop-shadow-md leading-tight">
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
            Rozpocznij arkusz
            <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  )
}
