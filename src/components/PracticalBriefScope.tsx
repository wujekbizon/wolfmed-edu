import { ListChecks, ListOrdered, Package, FileText } from 'lucide-react'
import type { PracticalBriefExamProps } from '@/types/practicalBriefTypes'

export default function PracticalBriefScope({ exam }: PracticalBriefExamProps) {
  return (
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 sm:p-6 flex flex-col gap-4">
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
          <div className='border-t border-zinc-200 pt-4'>
            <h3 className='mb-3 flex items-center gap-2 text-sm font-semibold text-zinc-800'><FileText size={16} />Dokumentacja do uzupełnienia</h3>
            <ul className='space-y-2'>{exam.forms.map((form) => <li key={form.id} className='text-sm text-zinc-600'>{form.title}</li>)}</ul>
          </div>
        </div>
  )
}
