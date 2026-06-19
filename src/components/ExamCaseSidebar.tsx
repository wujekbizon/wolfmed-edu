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

      {exam.assessedTasks.length > 0 && (
        <details className="rounded-xl border border-zinc-200 overflow-hidden group">
          <summary className="px-4 py-3 cursor-pointer text-sm font-semibold text-zinc-700 bg-zinc-50 select-none">
            Czynności oceniane na stanowisku
          </summary>
          <div className="flex flex-col gap-4 p-4">
            {exam.assessedTasks.map((task, index) => (
              <div key={index}>
                <p className="text-xs font-semibold text-zinc-600 mb-1.5">{task.title}</p>
                <ol className="list-decimal list-inside text-xs text-zinc-500 space-y-1">
                  {task.items.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  )
}
