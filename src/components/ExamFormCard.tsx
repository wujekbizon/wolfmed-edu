'use client'

import { ClipboardList } from 'lucide-react'
import ExamSectionHeader from '@/components/ExamSectionHeader'
import type { PublicExam, PublicExamForm } from '@/types/praktycznyTypes'

interface Props {
  exam: PublicExam
  form: PublicExamForm
  index: number
  answers: Record<string, string | string[]>
  onValueChange: (fieldId: string, value: string) => void
  onListLineChange: (fieldId: string, line: number, value: string) => void
  onChoiceToggle: (fieldId: string, optionId: string) => void
}

const inputClass =
  'w-full rounded-lg border border-zinc-200 bg-zinc-50/70 px-3 py-2.5 text-sm text-zinc-800 focus:outline-none focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-200 transition-colors'

export default function ExamFormCard({
  exam,
  form,
  index,
  answers,
  onValueChange,
  onListLineChange,
  onChoiceToggle,
}: Props) {
  return (
    <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
      <ExamSectionHeader
        icon={ClipboardList}
        badge={`Karta ${index + 1} z ${exam.forms.length}`}
        title={form.title}
        subtitle={form.intro}
      />

      <div className="p-5 md:p-6 flex flex-col gap-6">
        {form.fields.map((field) => {
          const key = `${form.id}:${field.id}`
          if (field.kind === 'value') {
            const value = typeof answers[key] === 'string' ? (answers[key] as string) : ''
            return (
              <div key={field.id} className="flex flex-col gap-2">
                <label htmlFor={`${form.id}-${field.id}`} className="text-sm font-semibold text-zinc-800">
                  {field.label}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id={`${form.id}-${field.id}`}
                    type="text"
                    value={value}
                    onChange={(e) => onValueChange(key, e.target.value)}
                    inputMode={field.match === 'number' ? 'numeric' : 'text'}
                    className={inputClass}
                  />
                  {field.unit && <span className="text-sm text-zinc-400 shrink-0">{field.unit}</span>}
                </div>
              </div>
            )
          }

          if (field.kind === 'choice') {
            const selected = Array.isArray(answers[key]) ? (answers[key] as string[]) : []
            return (
              <div key={field.id} className="flex flex-col gap-4">
                <label className="text-sm font-semibold text-zinc-800">{field.label}</label>
                {field.groups.map((group) => (
                  <div key={group.id} className="rounded-xl border border-zinc-200 overflow-hidden">
                    <p className="px-4 py-2.5 bg-zinc-50 border-b border-zinc-100 text-xs font-semibold text-zinc-600 uppercase tracking-wide">
                      {group.label}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 sm:gap-x-4">
                      {group.options.map((option) => {
                        const checked = selected.includes(option.id)
                        return (
                          <label
                            key={option.id}
                            className={`flex items-start gap-2.5 px-4 py-2.5 cursor-pointer transition-colors ${
                              checked ? 'bg-slate-50' : 'hover:bg-zinc-50'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => onChoiceToggle(key, option.id)}
                              className="mt-0.5 h-5 w-5 shrink-0 accent-slate-700"
                            />
                            <span className="text-sm text-zinc-700 leading-snug">{option.label}</span>
                          </label>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )
          }

          const lineValues = Array.isArray(answers[key]) ? (answers[key] as string[]) : []
          return (
            <div key={field.id} className="flex flex-col gap-2.5">
              <label className="text-sm font-semibold text-zinc-800">{field.label}</label>
              <div className="flex flex-col gap-2.5">
                {Array.from({ length: field.lines }).map((_, line) => (
                  <div key={line} className="flex items-center gap-3">
                    <span className="shrink-0 w-6 h-6 rounded-full bg-slate-100 border border-slate-200 text-slate-500 text-[11px] font-bold flex items-center justify-center">
                      {line + 1}
                    </span>
                    <input
                      type="text"
                      value={lineValues[line] ?? ''}
                      onChange={(e) => onListLineChange(key, line, e.target.value)}
                      className={inputClass}
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
