import Link from 'next/link'
import { ArrowLeft, Clock, FileText, Play } from 'lucide-react'
import type { PublicExam } from '@/types/praktycznyTypes'

interface Props {
  exam: PublicExam
  onStart: () => void
}

export default function ExamArkuszBrief({ exam, onStart }: Props) {
  return (
    <section className="flex flex-col items-center w-full h-full overflow-y-auto scrollbar-webkit px-2 sm:px-4 py-6 md:py-10">
      <div className="w-full max-w-3xl flex flex-col gap-6">
        <Link
          href="/panel/egzaminy"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-700 transition-colors w-fit"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Wróć do listy arkuszy
        </Link>

        <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden">
          <div className="flex flex-col gap-1 p-6 border-b border-zinc-100 bg-zinc-50">
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">
              Egzamin zawodowy — część praktyczna
            </p>
            <h1 className="text-xl md:text-2xl font-bold text-zinc-800 leading-tight">{exam.title}</h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-zinc-500">
              <span className="font-mono">{exam.arkusz}</span>
              <span className="inline-flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {exam.durationMinutes} minut
              </span>
              <span className="inline-flex items-center gap-1">
                <FileText className="w-3.5 h-3.5" />
                {exam.forms.length} {exam.forms.length === 1 ? 'karta' : 'karty'} do uzupełnienia
              </span>
            </div>
          </div>

          <div className="p-6 flex flex-col gap-6">
            <div>
              <h2 className="text-sm font-bold text-zinc-800 mb-2">Zadanie egzaminacyjne</h2>
              <p className="text-sm text-zinc-600 leading-relaxed">{exam.taskSummary}</p>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-zinc-50/60 p-5">
              <h2 className="text-sm font-bold text-zinc-800 mb-1">Informacje o pacjencie</h2>
              <p className="text-xs text-zinc-500 mb-3">
                {exam.patient.name}, PESEL {exam.patient.pesel}, {exam.patient.ward}
              </p>
              <p className="text-sm text-zinc-600 leading-relaxed">{exam.patient.description}</p>
            </div>

            <div className="flex flex-col gap-4">
              <h2 className="text-sm font-bold text-zinc-800">Czynności oceniane na stanowisku</h2>
              <p className="text-xs text-zinc-500 -mt-2">
                Poniższe czynności na egzaminie wykonujesz na fantomie i ocenia je egzaminator. W tej części
                ćwiczysz wypełnienie dokumentacji — przebieg czynności znajdziesz poniżej jako materiał pomocniczy.
              </p>
              {exam.assessedTasks.map((task, index) => (
                <div key={index} className="rounded-xl border border-zinc-200 overflow-hidden">
                  <p className="text-sm font-semibold text-zinc-700 bg-zinc-50 px-4 py-2.5 border-b border-zinc-100">
                    {task.title}
                  </p>
                  <ol className="divide-y divide-zinc-100">
                    {task.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-3 px-4 py-2.5">
                        <span className="shrink-0 w-5 h-5 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-500 text-[11px] font-bold flex items-center justify-center mt-0.5">
                          {i + 1}
                        </span>
                        <span className="text-sm text-zinc-600 leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={onStart}
          className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-700 hover:bg-slate-800 text-white text-sm font-semibold rounded-xl transition-colors w-full sm:w-auto sm:self-center"
        >
          <Play className="w-4 h-4" />
          Rozpocznij egzamin ({exam.durationMinutes} min)
        </button>
      </div>
    </section>
  )
}
