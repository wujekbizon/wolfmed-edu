import { User } from 'lucide-react'
import type { PublicExam } from '@/types/praktycznyTypes'

interface Props {
  exam: PublicExam
}

export default function ExamCaseSidebar({ exam }: Props) {
  return (
    <div className="flex flex-col gap-6 p-5 md:p-6">
      <div>
        <h2 className="text-sm font-bold text-zinc-800 mb-2 flex items-center gap-2">
          <User className="w-4 h-4 text-zinc-400" />
          Informacje o pacjencie
        </h2>
        <p className="text-xs text-zinc-500 mb-2">
          {exam.patient.name}, PESEL {exam.patient.pesel}, {exam.patient.ward}
        </p>
        <p className="text-sm text-zinc-600 leading-relaxed">{exam.patient.description}</p>
      </div>

      <div className="border-t border-zinc-100" />

      <div>
        <h2 className="text-sm font-bold text-zinc-800 mb-2">Zadanie egzaminacyjne</h2>
        <p className="text-sm text-zinc-600 leading-relaxed">{exam.taskSummary}</p>
      </div>
    </div>
  )
}
