'use client'

import { LETTERS } from '@/constants/optionsLetters'
import { Test } from '@/types/dataTypes'
import { useState } from 'react'

export default function LearningCard({ test, questionNumber }: { test: Test; questionNumber: string }) {
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false)
  const { answers, question } = test.data

  const handleCorrectAnswer = () => {
    setShowCorrectAnswer(!showCorrectAnswer)
  }

  return (
    <div className="relative flex min-h-[390px] w-full flex-col justify-between rounded-xl shadow-md shadow-zinc-500 border border-red-200/60 bg-zinc-50 p-3 sm:p-4 md:p-6 text-zinc-800">
      <p className="absolute right-2 top-1 sm:right-3 sm:top-2 md:right-4 md:top-3 text-xs sm:text-sm font-semibold text-red-400">
        {questionNumber}
      </p>
      <h3 className="mt-4 md:mt-5 mb-2 sm:mb-3 md:mb-4 text-xs xs:text-sm sm:text-base md:text-lg font-semibold leading-none">
        {question}
      </h3>
      <ul className="grow space-y-2 sm:space-y-3 md:space-y-4 overflow-y-auto mt-4 md:mt-0 scrollbar-webkit justify-center">
        {answers.map(({ option, isCorrect }, index) => (
          <li key={option} className="flex items-center">
            <span
              className={`mr-1 sm:mr-2 flex h-5 w-5 sm:h-6 sm:w-6 shrink-0 items-center justify-center rounded-full ${
                showCorrectAnswer && isCorrect ? 'bg-red-500 text-white' : 'bg-red-100 text-red-500'
              } text-xs sm:text-sm font-bold transition-all`}
            >
              {LETTERS[index]}
            </span>
            <span
              className={`flex-1 rounded-md px-0.5 sm:px-1 text-xs xs:text-sm sm:text-base transition-all ${
                showCorrectAnswer && (isCorrect ? 'bg-red-100 font-medium text-red-700' : 'opacity-70')
              }`}
            >
              {option}
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-3 sm:mt-4 md:mt-6 w-full sm:w-2/3 md:w-1/2 mx-auto">
        <button
          onClick={handleCorrectAnswer}
          className="w-full h-8 sm:h-10 md:h-12 rounded-lg px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm font-medium bg-[#ffb1b1] hover:bg-[#f58a8a] text-black hover:text-white transition-all focus:outline-none focus:ring-2 focus:ring-[#f58a8a] focus:ring-opacity-50 disabled:opacity-50 shadow-md hover:shadow-lg"
        >
          {showCorrectAnswer ? 'Ukryj Odpowiedź' : 'Pokaż Odpowiedź'}
        </button>
      </div>
    </div>
  )
}
