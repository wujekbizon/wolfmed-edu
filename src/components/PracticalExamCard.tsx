import Link from 'next/link'
import { ArrowRight, Clock, FileText, User } from 'lucide-react'
import type { PublicExam } from '@/types/praktycznyTypes'

interface Props {
  exam: PublicExam
}

export default function PracticalExamCard({ exam }: Props) {
  return (
    <Link
      href={`/panel/egzaminy/${exam.id}`}
      className="group flex flex-col bg-white border border-zinc-200 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
    >
      <div className="flex flex-col gap-1 p-6 border-b border-zinc-100 bg-zinc-50">
        <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">{exam.session}</p>
        <h2 className="text-lg font-bold text-zinc-800 leading-tight">{exam.title}</h2>
        <p className="text-xs font-mono text-zinc-400">{exam.arkusz}</p>
      </div>

      <div className="flex flex-col grow p-6 gap-4">
        <div className="flex items-start gap-2 text-sm text-zinc-600">
          <User className="w-4 h-4 mt-0.5 shrink-0 text-zinc-400" />
          <span>
            {exam.patient.name} — {exam.patient.ward}
          </span>
        </div>

        <div className="flex items-center gap-5">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500">
            <Clock className="w-3.5 h-3.5" />
            {exam.durationMinutes} min
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500">
            <FileText className="w-3.5 h-3.5" />
            {exam.forms.length} {exam.forms.length === 1 ? 'karta' : 'karty'} do uzupełnienia
          </span>
        </div>

        <div className="mt-auto pt-1">
          <span className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-zinc-800 group-hover:bg-zinc-900 text-white text-sm font-medium rounded-xl transition-all duration-200">
            Rozpocznij arkusz
            <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  )
}
