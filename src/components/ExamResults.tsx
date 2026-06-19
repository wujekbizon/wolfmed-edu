'use client'

import Link from 'next/link'
import { Check, X, RotateCcw, ArrowLeft } from 'lucide-react'
import type { ExamResult } from '@/types/praktycznyTypes'

interface Props {
  result: ExamResult
  answers: Record<string, string | string[]>
  onRestart: () => void
}

function userAnswerText(answer: string | string[] | undefined): string[] {
  if (Array.isArray(answer)) return answer.map((a) => a.trim()).filter((a) => a.length > 0)
  if (typeof answer === 'string' && answer.trim().length > 0) return [answer.trim()]
  return []
}

export default function ExamResults({ result, answers, onRestart }: Props) {
  return (
    <section className="flex flex-col items-center w-full h-full overflow-y-auto scrollbar-webkit px-2 sm:px-4 py-6 md:py-10">
      <div className="w-full max-w-3xl flex flex-col gap-6">
        <div
          className={`rounded-2xl border p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${
            result.passed ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
          }`}
        >
          <div>
            <p className={`text-xs font-semibold uppercase tracking-widest ${result.passed ? 'text-green-600' : 'text-red-600'}`}>
              {result.passed ? 'Arkusz zaliczony' : 'Arkusz niezaliczony'}
            </p>
            <h1 className="text-2xl font-bold text-zinc-800 mt-1">{result.percent}%</h1>
            <p className="text-sm text-zinc-500 mt-1">
              {result.earned} / {result.max} punktów · próg zaliczenia 75%
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onRestart}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-700 hover:bg-slate-800 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Wypełnij ponownie
            </button>
            <Link
              href="/panel/egzaminy"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-zinc-50 text-zinc-700 text-sm font-semibold rounded-xl border border-zinc-300 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Lista arkuszy
            </Link>
          </div>
        </div>

        {result.procedures.map((proc) => (
          <div key={proc.taskIndex} className="bg-white border border-zinc-200 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 md:px-6 py-4 border-b border-zinc-100 bg-zinc-50">
              <h2 className="text-base font-bold text-zinc-800">Czynności: {proc.title}</h2>
              <span className="text-sm font-semibold text-zinc-500 shrink-0">
                {proc.earned} / {proc.max} pkt
              </span>
            </div>
            <ol className="divide-y divide-zinc-100">
              {proc.correctSteps.map((step, i) => {
                const ok = proc.userSteps[i] === step
                return (
                  <li key={i} className="px-5 md:px-6 py-3 flex items-start gap-3">
                    <span
                      className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5 ${
                        ok ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                      }`}
                    >
                      {ok ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm text-zinc-700 leading-snug">
                        <span className="font-semibold text-zinc-400 mr-1">{i + 1}.</span>
                        {step}
                      </p>
                      {!ok && proc.userSteps[i] && (
                        <p className="text-xs text-red-500 mt-0.5">Na tej pozycji ustawiono: {proc.userSteps[i]}</p>
                      )}
                    </div>
                  </li>
                )
              })}
            </ol>
          </div>
        ))}

        {result.forms.map((form) => (
          <div key={form.formId} className="bg-white border border-zinc-200 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 md:px-6 py-4 border-b border-zinc-100 bg-zinc-50">
              <h2 className="text-base font-bold text-zinc-800">{form.title}</h2>
              <span className="text-sm font-semibold text-zinc-500 shrink-0">
                {form.earned} / {form.max} pkt
              </span>
            </div>

            <div className="divide-y divide-zinc-100">
              {form.fields.map((field) => {
                const passed = field.earned >= field.max
                const given = userAnswerText(answers[`${form.formId}:${field.fieldId}`])
                return (
                  <div key={field.fieldId} className="px-5 md:px-6 py-4 flex flex-col gap-2">
                    <div className="flex items-start gap-3">
                      <span
                        className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5 ${
                          passed ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                        }`}
                      >
                        {passed ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                      </span>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-zinc-700">{field.label}</p>
                        <p className="text-xs text-zinc-400 mt-0.5">
                          {field.kind === 'list'
                            ? `${field.earned} z ${field.max} wymaganych`
                            : passed
                            ? 'Zaliczone'
                            : 'Niezaliczone'}
                        </p>
                      </div>
                    </div>

                    {given.length > 0 && (
                      <div className="pl-8">
                        <p className="text-xs font-semibold text-zinc-400 mb-1">Twoja odpowiedź</p>
                        <ul className="text-sm text-zinc-600 list-disc list-inside space-y-0.5">
                          {given.map((g, i) => (
                            <li key={i}>{g}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {field.modelAnswers.length > 0 && (
                      <div className="pl-8">
                        <p className="text-xs font-semibold text-zinc-400 mb-1">
                          {field.kind === 'list' ? 'Przykładowe poprawne odpowiedzi' : 'Klucz odpowiedzi'}
                        </p>
                        <ul className="text-sm text-zinc-500 list-disc list-inside space-y-0.5">
                          {field.modelAnswers.map((m, i) => (
                            <li key={i}>{m}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}

      </div>
    </section>
  )
}
