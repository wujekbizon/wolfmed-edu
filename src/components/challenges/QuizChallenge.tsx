'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import ChallengeButton from '@/components/ChallengeButton'
import { completeChallengeAction } from '@/actions/challenges'
import { generateQuizChallenge } from '@/helpers/challengeGenerator'
import type { Procedure } from '@/types/dataTypes'
import { ChallengeType, QuizQuestion } from '@/types/challengeTypes'

interface Props {
  procedure: Procedure
}

export default function QuizChallenge({ procedure }: Props) {
  const router = useRouter()
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [startTime] = useState(Date.now())

  useEffect(() => {
    const quiz = generateQuizChallenge(procedure)
    setQuestions(quiz.questions)
  }, [procedure])

  function handleAnswerSelect(questionId: string, optionIndex: number) {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }))
  }

  function calculateScore(): number {
    if (questions.length === 0) return 0

    let correctCount = 0
    questions.forEach((question) => {
      if (answers[question.id] === question.correctAnswer) {
        correctCount++
      }
    })

    return Math.round((correctCount / questions.length) * 100)
  }

  async function submitQuiz() {
    const score = calculateScore()
    const timeSpent = Math.floor((Date.now() - startTime) / 1000) // seconds

    setIsSubmitting(true)

    toast.success(`Twój wynik: ${score}%`, {
      duration: 3000,
      position: 'bottom-center',
    })

    try {
      const result = await completeChallengeAction(
        procedure.id,
        procedure.data.name,
        ChallengeType.KNOWLEDGE_QUIZ,
        score,
        timeSpent
      )

      if (result.success) {
        if (result.data?.badgeEarned) {
          toast.success('🎉 Gratulacje! Zdobyłeś odznakę!', {
            duration: 5000,
            position: 'top-center',
          })
        }

        setTimeout(() => {
          router.push(`/panel/procedury/${procedure.id}/wyzwania`)
        }, 2000)
      } else {
        toast.error(result.error || 'Failed to save progress')
        setIsSubmitting(false)
      }
    } catch (error) {
      console.error('Submit error:', error)
      toast.error('Failed to submit challenge')
      setIsSubmitting(false)
    }
  }

  function handleCancel() {
    router.push(`/panel/procedury/${procedure.id}/wyzwania`)
  }

  if (questions.length === 0) {
    return <div className="p-4">Loading...</div>
  }

  const allAnswered = questions.every((q) => answers[q.id] !== undefined)

  return (
    <div className="flex flex-col items-center gap-8 px-1 sm:px-4 py-4 w-full min-h-screen">
      <div className="w-full md:w-[85%] lg:w-3/4 xl:w-2/3 2xl:w-[60%] bg-zinc-100 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-2 text-zinc-800">Quiz wiedzy</h2>
        <h3 className="text-lg mb-6 text-zinc-600">{procedure.data.name}</h3>

        <div className="space-y-6 mb-8">
          {questions.map((question, index) => (
            <div key={question.id} className="bg-white p-4 rounded-lg shadow">
              <p className="font-semibold text-zinc-800 mb-4">
                {index + 1}. {question.question}
              </p>

              <div className="space-y-2">
                {question.options.map((option, optionIndex) => {
                  const isSelected = answers[question.id] === optionIndex

                  return (
                    <button
                      key={optionIndex}
                      onClick={() => handleAnswerSelect(question.id, optionIndex)}
                      disabled={isSubmitting}
                      className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-zinc-300 hover:border-zinc-400'
                      } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      {option}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <ChallengeButton onClick={submitQuiz} disabled={!allAnswered || isSubmitting}>
            {!allAnswered ? 'Odpowiedz na wszystkie pytania' : 'Zatwierdź Odpowiedzi'}
          </ChallengeButton>
          <ChallengeButton onClick={handleCancel} disabled={isSubmitting}>
            Anuluj
          </ChallengeButton>
        </div>
      </div>
    </div>
  )
}
