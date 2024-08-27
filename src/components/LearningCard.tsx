'use client'

import { LETTERS } from '@/constants/optionsLetters'
import { Test } from '@/types/dataTypes'
import { useState } from 'react'

export default function LearningCard(props: { test: Test; questionNumber: string }) {
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false)
  const { answers, question } = props.test.data

  const handleCorrectAnswer = () => {
    setShowCorrectAnswer(!showCorrectAnswer)
  }

  return (
    <div className="relative flex h-full min-h-[340px] w-full flex-col rounded-lg shadow-md shadow-zinc-500 border border-red-100/50 bg-white px-4 py-6 text-zinc-900">
      <p className="absolute right-2 top-1 text-sm text-muted-foreground">{props.questionNumber}</p>
      <h3 className="border-b border-border/40 px-4 pb-2 text-base">{question}</h3>
      <ul className="flex h-full flex-col gap-2 px-4 pt-6">
        {answers.map(({ option, isCorrect }, index) => (
          <li key={option} className="text-balance text-sm leading-relaxed text-[#ffabab]">
            <span
              className={`${showCorrectAnswer && (isCorrect ? 'text-[#ff6060]' : 'opacity-25')} transition-opacity`}
            >
              {' '}
              {LETTERS[index]})
            </span>{' '}
            <span
              className={`${
                showCorrectAnswer && (isCorrect ? 'rounded-xl bg-[#ffdcdc] ' : 'opacity-25')
              } text-sm px-2 py-0.5 text-zinc-800  transition-opacity`}
            >
              {' '}
              {option}
            </span>
          </li>
        ))}
      </ul>
      <div className="flex w-full self-center md:w-1/2">
        <button
          onClick={handleCorrectAnswer}
          className="flex h-9 w-full mt-2 items-center justify-center rounded-lg  px-4 py-2 text-base font-medium bg-[#ffb1b1] hover:text-[#fffcfc] border border-red-100/50 hover:border-zinc-900 hover:shadow-sm hover:bg-[#f58a8a] text-black transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
        >
          {showCorrectAnswer ? 'Ukryj Odpowiedź' : 'Pokaż Odpowiedź'}
        </button>
      </div>
    </div>
  )
}
