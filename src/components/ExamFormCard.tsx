'use client'

import type { PublicExam, PublicExamForm } from '@/types/praktycznyTypes'

interface Props {
  exam: PublicExam
  form: PublicExamForm
  index: number
  answers: Record<string, string | string[]>
  onValueChange: (fieldId: string, value: string) => void
  onListLineChange: (fieldId: string, line: number, value: string) => void
}

export default function ExamFormCard({
  exam,
  form,
  index,
  answers,
  onValueChange,
  onListLineChange,
}: Props) {
  return (
    <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden">
      <div className="px-5 md:px-6 py-4 border-b border-zinc-100 bg-zinc-50">
        <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">
          Karta {index + 1} z {exam.forms.length}
        </p>
        <h2 className="text-base md:text-lg font-bold text-zinc-800 leading-snug">{form.title}</h2>
        {form.intro && <p className="text-xs text-zinc-500 mt-1">{form.intro}</p>}
      </div>

      <div className="p-5 md:p-6 flex flex-col gap-6">
        {form.fields.map((field) => {
          const key = `${form.id}:${field.id}`
          if (field.kind === 'value') {
            const value = typeof answers[key] === 'string' ? (answers[key] as string) : ''
            return (
              <div key={field.id} className="flex flex-col gap-1.5">
                <label htmlFor={`${form.id}-${field.id}`} className="text-sm font-medium text-zinc-700">
                  {field.label}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id={`${form.id}-${field.id}`}
                    type="text"
                    value={value}
                    onChange={(e) => onValueChange(key, e.target.value)}
                    inputMode={field.match === 'number' ? 'numeric' : 'text'}
                    className="flex-1 border-b border-dashed border-zinc-300 bg-transparent px-1 py-1.5 text-sm text-zinc-800 focus:outline-none focus:border-slate-500 transition-colors"
                  />
                  {field.unit && <span className="text-sm text-zinc-400 shrink-0">{field.unit}</span>}
                </div>
              </div>
            )
          }

          const lineValues = Array.isArray(answers[key]) ? (answers[key] as string[]) : []
          return (
            <div key={field.id} className="flex flex-col gap-2">
              <label className="text-sm font-medium text-zinc-700">{field.label}</label>
              <div className="flex flex-col gap-2.5">
                {Array.from({ length: field.lines }).map((_, line) => (
                  <div key={line} className="flex items-center gap-3">
                    <span className="shrink-0 w-5 h-5 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-400 text-[11px] font-bold flex items-center justify-center">
                      {line + 1}
                    </span>
                    <input
                      type="text"
                      value={lineValues[line] ?? ''}
                      onChange={(e) => onListLineChange(key, line, e.target.value)}
                      className="flex-1 border-b border-dashed border-zinc-300 bg-transparent px-1 py-1.5 text-sm text-zinc-800 focus:outline-none focus:border-slate-500 transition-colors"
                    />
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
