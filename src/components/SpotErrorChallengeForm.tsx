'use client'

import { useState, useEffect } from 'react'
import { useActionState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import SubmitButton from '@/components/SubmitButton'
import { submitSpotErrorAction } from '@/actions/challenges'
import { useToastMessage } from '@/hooks/useToastMessage'
import { EMPTY_FORM_STATE } from '@/constants/formState'
import { generateSpotErrorChallenge } from '@/helpers/challengeGenerator'
import type { Procedure } from '@/types/dataTypes'
import { getProcedureSlugFromId } from '@/constants/procedureSlugs'
import { ERROR_CATEGORY_LABELS, ERROR_CATEGORY_COLORS } from '@/types/challengeTypes'

interface Props {
  procedure: Procedure
}

export default function SpotErrorChallengeForm({ procedure }: Props) {
  const router = useRouter()
  const procedureSlug = getProcedureSlugFromId(procedure.id) || procedure.id
  const [state, action] = useActionState(submitSpotErrorAction, EMPTY_FORM_STATE)
  const [selectedErrors, setSelectedErrors] = useState<Set<string>>(new Set())
  const [startTime] = useState(Date.now())
  const [challenge] = useState(() => generateSpotErrorChallenge(procedure))
  const noScriptFallback = useToastMessage(state)

  const timeSpent = Math.floor((Date.now() - startTime) / 1000)

  function toggleError(stepId: string) {
    setSelectedErrors((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(stepId)) {
        newSet.delete(stepId)
      } else {
        newSet.add(stepId)
      }
      return newSet
    })
  }


  useEffect(() => {
    if (state.status === 'SUCCESS') {
      const timer = setTimeout(() => {
        router.push(`/panel/procedury/${procedureSlug}/wyzwania`)
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [state.status, procedure.id])
  

  return (
    <section className="flex flex-col items-center gap-8 px-4 sm:px-6 py-8 w-full h-full overflow-y-auto scrollbar-webkit bg-gradient-to-br from-zinc-50 via-white to-zinc-50">
      <div className="w-full md:w-[85%] lg:w-3/4 xl:w-2/3 2xl:w-[60%] bg-white p-8 rounded-xl shadow-lg border border-zinc-200">
        {/* Header */}
        <h2 className="text-2xl font-bold mb-2 text-zinc-900">Znajdź błąd</h2>
        <h3 className="text-lg font-medium mb-3 text-zinc-700">{procedure.data.name}</h3>

        {/* Instructions */}
        <div className="bg-blue-50 border-l-4 border-blue-400 rounded-r-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-blue-900 mb-1">
                Zaznacz wszystkie kroki, które zawierają błędy
              </p>
              <p className="text-xs text-blue-700">
                Przeanalizuj każdy krok uważnie. Procedura może zawierać błędy dotyczące bezpieczeństwa, kolejności, techniki wykonania lub pomiarów.
              </p>
            </div>
          </div>
        </div>

        {/* Error Categories Legend */}
        <div className="mb-6 p-4 bg-zinc-50 rounded-lg border border-zinc-200">
          <h4 className="text-sm font-semibold text-zinc-700 mb-3">Kategorie błędów:</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            {Object.entries(ERROR_CATEGORY_LABELS).map(([key, label]) => {
              const colors = ERROR_CATEGORY_COLORS[key as keyof typeof ERROR_CATEGORY_COLORS]
              return (
                <div key={key} className={`flex items-center gap-2 px-3 py-2 rounded-md border ${colors?.border} ${colors?.bg}`}>
                  <div className={`w-2 h-2 rounded-full ${colors?.bg} ${colors?.border} border-2`} />
                  <span className={`text-xs font-medium ${colors?.text}`}>{label}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Error Counter Badge */}
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium mb-6 transition-all duration-200 ${
          selectedErrors.size > 0
            ? 'bg-red-50 border-red-300 text-red-700'
            : 'bg-zinc-100 border-zinc-300 text-zinc-700'
        }`}>
          {selectedErrors.size > 0 && (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          <span>Zaznaczono błędów: {selectedErrors.size}</span>
        </div>

        <form action={action}>
          <input type="hidden" name="procedureId" value={procedure.id} />
          <input type="hidden" name="procedureName" value={procedure.data.name} />
          <input type="hidden" name="selectedErrors" value={JSON.stringify(Array.from(selectedErrors))} />
          <input type="hidden" name="timeSpent" value={timeSpent} />

          {/* Steps List */}
          <div className="mb-8 space-y-3">
            {challenge.steps.map((step, index) => {
              const isSelected = selectedErrors.has(step.id)

              return (
                <div
                  key={step.id}
                  className="animate-fadeInUp"
                  style={{ '--slidein-delay': `${index * 0.05}s` } as React.CSSProperties}
                >
                  <div
                    className={`group relative bg-white p-5 rounded-lg border-2 transition-all duration-200 hover:shadow-md cursor-pointer ${
                      isSelected
                        ? 'border-red-400 bg-red-50/50 shadow-sm'
                        : 'border-zinc-200 hover:border-zinc-300'
                    }`}
                    onClick={() => toggleError(step.id)}
                  >
                    <div className="flex items-start gap-4">
                      {/* Custom Checkbox */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleError(step.id)
                        }}
                        className={`shrink-0 w-7 h-7 rounded-md border-2 transition-all duration-200 flex items-center justify-center focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 ${
                          isSelected
                            ? 'border-red-500 bg-red-500 hover:bg-red-600 hover:border-red-600 shadow-sm'
                            : 'border-zinc-300 bg-white hover:border-zinc-400 hover:bg-zinc-50'
                        }`}
                      >
                        {isSelected && (
                          <svg
                            className="w-5 h-5 text-white"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="3"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>

                      {/* Step Number Badge */}
                      <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold shrink-0 transition-colors duration-200 ${
                        isSelected
                          ? 'bg-red-100 text-red-700'
                          : 'bg-zinc-100 text-zinc-700'
                      }`}>
                        {index + 1}
                      </div>

                      {/* Step Text */}
                      <div className="flex-1">
                        <p className={`text-base leading-relaxed transition-colors duration-200 ${
                          isSelected
                            ? 'text-red-900 font-medium'
                            : 'text-zinc-800'
                        }`}>
                          {step.step}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 w-full">
            <SubmitButton
              disabled={selectedErrors.size === 0}
              label={selectedErrors.size === 0 ? 'Zaznacz przynajmniej jeden błąd' : `Zatwierdź (${selectedErrors.size})`}
              loading="Sprawdzanie..."
              className={`flex-1 h-11 sm:h-12 px-6 font-medium text-base rounded-lg transition-all duration-200 ${
                selectedErrors.size > 0
                  ? 'bg-zinc-900 text-white hover:bg-zinc-800 shadow-md hover:shadow-lg'
                  : 'bg-zinc-300 text-zinc-500 cursor-not-allowed'
              }`}
            />
            <Link
              href={`/panel/procedury/${procedureSlug}/wyzwania`}
              className="h-11 sm:h-12 px-6 bg-white text-zinc-700 border-2 border-zinc-300 font-medium text-base rounded-lg hover:bg-zinc-50 hover:border-zinc-400 transition-all duration-200 flex items-center justify-center"
            >
              Anuluj
            </Link>
          </div>
          {noScriptFallback}
        </form>
      </div>
    </section>
  )
}
