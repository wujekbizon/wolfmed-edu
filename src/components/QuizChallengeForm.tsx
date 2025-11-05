'use client'

import { useState, useEffect, useMemo } from 'react'
import { useActionState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import SubmitButton from '@/components/SubmitButton'
import QuizChallengeSkeleton from '@/components/skeletons/QuizChallengeSkeleton'
import { submitQuizAction } from '@/actions/challenges'
import { useToastMessage } from '@/hooks/useToastMessage'
import { EMPTY_FORM_STATE } from '@/constants/formState'
import { generateQuizChallenge } from '@/helpers/challengeGenerator'
import type { Procedure } from '@/types/dataTypes'
import type { QuizQuestion } from '@/types/challengeTypes'
import { getProcedureSlugFromId } from '@/constants/procedureSlugs'

interface Props {
  procedure: Procedure
}

export default function QuizChallengeForm({ procedure }: Props) {
  const router = useRouter()
  const procedureSlug = getProcedureSlugFromId(procedure.id) || procedure.id
  const [state, action] = useActionState(submitQuizAction, EMPTY_FORM_STATE)
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [startTime] = useState(Date.now())
  const noScriptFallback = useToastMessage(state)

   useEffect(() => {
    if (state.status === 'SUCCESS') {
      const timer = setTimeout(() => {
        router.push(`/panel/procedury/${procedureSlug}/wyzwania`)
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [state.status, procedure.id])
  

  useEffect(() => {
    const quiz = generateQuizChallenge(procedure)
    setQuestions(quiz.questions)
  }, [procedure])

  const correctAnswers = useMemo(() => {
    return questions.reduce((acc, q) => {
      acc[q.id] = q.correctAnswer
      return acc
    }, {} as Record<string, number>)
  }, [questions])

  function handleAnswerSelect(questionId: string, optionIndex: number) {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }))
  }


  if (questions.length === 0) {
    return <QuizChallengeSkeleton />
  }

  const allAnswered = questions.every((q) => answers[q.id] !== undefined)
  const timeSpent = Math.floor((Date.now() - startTime) / 1000)

  const answeredCount = Object.keys(answers).length
  const totalQuestions = questions.length
  const progressPercentage = (answeredCount / totalQuestions) * 100

  return (
    <section className="flex flex-col items-center gap-8 px-4 sm:px-6 py-8 w-full h-full overflow-y-auto scrollbar-webkit bg-gradient-to-br from-zinc-50 via-white to-zinc-50">
      <div className="w-full md:w-[85%] lg:w-3/4 xl:w-2/3 2xl:w-[60%] bg-white p-8 rounded-xl shadow-lg border border-zinc-200">
        {/* Header */}
        <h2 className="text-2xl font-bold mb-2 text-zinc-900">Quiz wiedzy</h2>
        <h3 className="text-lg font-medium mb-6 text-zinc-700">{procedure.data.name}</h3>

        {/* Progress Indicator */}
        <div className="mb-8">
          {/* Progress Bar */}
          <div className="relative w-full h-2 bg-zinc-200 rounded-full overflow-hidden mb-4">
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-zinc-700 to-zinc-900 transition-all duration-500 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>

          {/* Progress Dots */}
          <div className="flex items-center justify-between gap-2">
            {questions.map((question, index) => {
              const isAnswered = answers[question.id] !== undefined
              return (
                <div
                  key={question.id}
                  className={`flex-1 h-2 rounded-full transition-all duration-300 ${
                    isAnswered
                      ? 'bg-zinc-800 shadow-sm'
                      : 'bg-zinc-200'
                  }`}
                  title={`Pytanie ${index + 1}${isAnswered ? ' - odpowiedziane' : ''}`}
                />
              )
            })}
          </div>

          {/* Progress Text */}
          <p className="text-sm text-zinc-600 mt-3 text-center font-medium">
            Postęp: {answeredCount} / {totalQuestions} pytań
          </p>
        </div>

        <form action={action}>
          <input type="hidden" name="procedureId" value={procedure.id} />
          <input type="hidden" name="procedureName" value={procedure.data.name} />
          <input type="hidden" name="answers" value={JSON.stringify(answers)} />
          <input type="hidden" name="correctAnswers" value={JSON.stringify(correctAnswers)} />
          <input type="hidden" name="timeSpent" value={timeSpent} />

          {/* Questions */}
          <div className="space-y-6 mb-8">
            {questions.map((question, questionIndex) => (
              <div
                key={question.id}
                className="bg-white p-6 rounded-lg border-2 border-zinc-200 shadow-sm hover:shadow-md transition-shadow duration-200 animate-fadeInUp"
                style={{ '--slidein-delay': `${questionIndex * 0.1}s` } as React.CSSProperties}
              >
                {/* Question Header */}
                <div className="flex items-start gap-3 mb-5">
                  {/* Question Number Badge */}
                  <div className="shrink-0 w-8 h-8 rounded-full bg-zinc-800 text-white flex items-center justify-center text-sm font-bold shadow-sm">
                    {questionIndex + 1}
                  </div>

                  {/* Question Text */}
                  <p className="flex-1 text-base font-semibold text-zinc-800 leading-relaxed pt-1">
                    {question.question}
                  </p>
                </div>

                {/* Options */}
                <div className="space-y-3 pl-11">
                  {question.options.map((option, optionIndex) => {
                    const isSelected = answers[question.id] === optionIndex
                    const letter = String.fromCharCode(65 + optionIndex) // A, B, C, D

                    return (
                      <button
                        key={optionIndex}
                        type="button"
                        onClick={() => handleAnswerSelect(question.id, optionIndex)}
                        className={`w-full flex items-start gap-4 p-4 rounded-lg border-2 transition-all duration-200 text-left group ${
                          isSelected
                            ? 'border-zinc-800 bg-zinc-50 shadow-md'
                            : 'border-zinc-300 hover:border-zinc-400 hover:bg-zinc-50'
                        }`}
                      >
                        {/* Custom Radio Button */}
                        <div className="shrink-0 relative">
                          <div
                            className={`w-6 h-6 rounded-full border-2 transition-all duration-200 flex items-center justify-center ${
                              isSelected
                                ? 'border-zinc-800 bg-zinc-800'
                                : 'border-zinc-400 bg-white group-hover:border-zinc-500'
                            }`}
                          >
                            {isSelected && (
                              <svg
                                className="w-4 h-4 text-white"
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
                          </div>
                        </div>

                        {/* Letter Badge */}
                        <div className={`shrink-0 w-7 h-7 rounded-md flex items-center justify-center text-sm font-bold transition-colors duration-200 ${
                          isSelected
                            ? 'bg-zinc-800 text-white'
                            : 'bg-zinc-200 text-zinc-700 group-hover:bg-zinc-300'
                        }`}>
                          {letter}
                        </div>

                        {/* Option Text */}
                        <span className={`flex-1 text-base leading-relaxed transition-colors duration-200 ${
                          isSelected
                            ? 'text-zinc-900 font-medium'
                            : 'text-zinc-700'
                        }`}>
                          {option}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 w-full">
            <SubmitButton
              disabled={!allAnswered}
              label={!allAnswered ? 'Odpowiedz na wszystkie pytania' : `Zatwierdź Odpowiedzi (${answeredCount}/${totalQuestions})`}
              loading="Sprawdzanie..."
              className={`flex-1 h-11 sm:h-12 px-6 font-medium text-base rounded-lg transition-all duration-200 ${
                allAnswered
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
