import Link from 'next/link'
import {
  ArrowLeft,
  ClipboardCheck,
  ClipboardList,
  Clock,
  FileText,
  ListChecks,
  ListOrdered,
  Package,
  Play,
  Target,
  User,
} from 'lucide-react'
import { PRACTICAL_PASSING_PERCENT } from '@/types/praktycznyTypes'
import type { PublicExam } from '@/types/praktycznyTypes'

interface Props {
  exam: PublicExam
  onStart: () => void
}

function StatTile({
  icon: Icon,
  value,
  label,
  accent,
}: {
  icon: typeof Clock
  value: string
  label: string
  accent?: boolean
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white p-3">
      <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-zinc-100 text-zinc-500 shrink-0">
        <Icon className="w-4 h-4" />
      </span>
      <div className="flex flex-col leading-tight">
        <span className={`text-sm font-bold ${accent ? 'text-[#ff5b5b]' : 'text-zinc-800'}`}>{value}</span>
        <span className="text-[11px] text-zinc-500">{label}</span>
      </div>
    </div>
  )
}

export default function ExamArkuszBrief({ exam, onStart }: Props) {
  const assessedCount = exam.assessedTasks.length

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

        {/* Header */}
        <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden">
          <div className="border-l-4 border-slate-700 p-5 sm:p-6 bg-zinc-50">
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">
              Egzamin zawodowy — część praktyczna
            </p>
            <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 leading-tight mt-1">
              {exam.title}
            </h1>
            <span className="inline-block mt-2 font-mono text-xs text-zinc-500 bg-white border border-zinc-200 rounded px-2 py-0.5">
              {exam.arkusz}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 p-4 sm:p-6">
            <StatTile icon={Clock} value={`${exam.durationMinutes} min`} label="Czas trwania" />
            <StatTile
              icon={FileText}
              value={`${exam.forms.length} ${exam.forms.length === 1 ? 'karta' : 'karty'}`}
              label="Do uzupełnienia"
            />
            <StatTile icon={ClipboardCheck} value={`${assessedCount}`} label="Zadania oceniane" />
            <StatTile icon={Target} value={`${PRACTICAL_PASSING_PERCENT}%`} label="Próg zaliczenia" accent />
          </div>
        </div>

        {/* Task */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6">
          <h2 className="flex items-center gap-2 text-base font-bold text-zinc-900 mb-3">
            <ClipboardList className="w-4 h-4 text-zinc-400" />
            Zadanie egzaminacyjne
          </h2>
          <p className="text-sm text-zinc-700 leading-relaxed">{exam.taskSummary}</p>
        </div>

        {/* Patient — focal card */}
        <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden">
          <div className="flex items-center gap-3 p-5 border-b border-zinc-100 bg-zinc-50">
            <span className="flex items-center justify-center w-11 h-11 rounded-full bg-slate-100 border border-slate-200 text-slate-600 shrink-0">
              <User className="w-5 h-5" />
            </span>
            <div className="flex flex-col gap-1">
              <h2 className="text-base font-bold text-zinc-900 leading-tight">{exam.patient.name}</h2>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-zinc-100 border border-zinc-200 text-zinc-600 text-xs px-2 py-0.5">
                  {exam.patient.ward}
                </span>
                {exam.patient.pesel && (
                  <span className="font-mono text-xs text-zinc-400">PESEL {exam.patient.pesel}</span>
                )}
              </div>
            </div>
          </div>
          <div className="p-5">
            <p className="text-sm text-zinc-700 leading-relaxed">{exam.patient.description}</p>
          </div>
        </div>

        {/* Scope */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6 flex flex-col gap-4">
          <div>
            <h2 className="flex items-center gap-2 text-base font-bold text-zinc-900">
              <ListChecks className="w-4 h-4 text-zinc-400" />
              Zakres egzaminu
            </h2>
            <p className="text-xs text-zinc-500 mt-1.5 leading-relaxed">
              W tym arkuszu przygotujesz zestaw, ułożysz w prawidłowej kolejności czynności praktyczne
              (oceniane na egzaminie przez egzaminatora) oraz wypełnisz dokumentację. Wszystko liczy się do wyniku.
            </p>
          </div>

          {exam.assessedTasks.map((task, index) => (
            <div key={index} className="rounded-xl border border-zinc-200 overflow-hidden">
              <p className="flex items-center gap-2 text-sm font-semibold text-zinc-700 bg-zinc-50 px-4 py-2.5 border-b border-zinc-100">
                {task.type === 'equipment' ? (
                  <Package className="w-4 h-4 text-zinc-400 shrink-0" />
                ) : (
                  <ListOrdered className="w-4 h-4 text-zinc-400 shrink-0" />
                )}
                {task.title}
              </p>
              {task.type === 'equipment' ? (
                <ol className="divide-y divide-zinc-100">
                  {task.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 px-4 py-2.5">
                      <span className="shrink-0 w-5 h-5 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-500 text-[11px] font-bold flex items-center justify-center mt-0.5">
                        {i + 1}
                      </span>
                      <span className="text-sm text-zinc-700 leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="px-4 py-3 text-sm text-zinc-500">
                  {task.items.length} czynności do uporządkowania w prawidłowej kolejności — oceniane
                  przez egzaminatora podczas wykonania.
                </p>
              )}
            </div>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={onStart}
          className="inline-flex items-center justify-center gap-2 px-6 py-4 bg-slate-700 hover:bg-slate-800 text-white text-base font-semibold rounded-xl transition-colors w-full"
        >
          <Play className="w-5 h-5" />
          Rozpocznij egzamin ({exam.durationMinutes} min)
        </button>
      </div>
    </section>
  )
}
