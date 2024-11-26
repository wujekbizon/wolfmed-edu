import { LETTERS } from '@/constants/optionsLetters'
import { Test } from '@/types/dataTypes'
import { useState, useEffect } from 'react'
import Label from './Label'
import { FormState } from '@/types/actionTypes'

export default function TestCard(props: { test: Test; questionNumber: string; formState: FormState }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const {
    data: { answers, question },
  } = props.test

  // Use useEffect to set the activeIndex based on the formState values
  useEffect(() => {
    if (props.formState.values) {
      const savedAnswer = props.formState.values[`answer-${props.test.id}`]
      if (savedAnswer !== undefined) {
        const index = answers.findIndex((answer) => answer.isCorrect === (savedAnswer === 'true'))
        setActiveIndex(index !== -1 ? index : null)
      }
    }
  }, [props.formState.values, answers, props.test.id])

  return (
    <div className="relative flex h-full min-h-80 w-full flex-col rounded-lg shadow-md shadow-zinc-500 border border-red-100/50 bg-white px-4 py-6 text-zinc-900">
      <p className="absolute right-2 top-1 text-sm text-muted-foreground">{props.questionNumber}</p>

      <h3 className="border-b border-border/40 px-1 xs:px-4 pb-2 text-base">{question}</h3>
      <div className="flex h-full w-full flex-col gap-1 px-1 xs:px-4 pt-4 ">
        {answers.map((answer, index) => {
          return (
            <div
              className={`flex w-full items-center gap-4 rounded-lg px-1 py-1 ${
                (props.formState.status === 'UNSET' || props.formState.status === 'ERROR') && 'hover:bg-[#ffdcdc]'
              } ${props.formState.status === 'UNSET' && activeIndex === index && 'bg-[#ffdcdc]'} ${
                props.formState.status === 'SUCCESS' &&
                (answer.isCorrect ? 'bg-green-300/40' : 'bg-red-300/40 opacity-50')
              }`}
              key={`${answer.option}/${index}`}
            >
              <span className="w-3 text-balance text-sm leading-relaxed text-zinc-500">{LETTERS[index]})</span>

              <div className="flex items-center gap-4" onClick={() => setActiveIndex(index)}>
                <input
                  className={`${
                    props.formState.status === 'SUCCESS' &&
                    activeIndex === index &&
                    'bg-[#ff6060] before:animate-none before:bg-[#ff6060]'
                  } before:content[''] border-zinc-500 before:bg-blue-gray-500 peer relative h-3.5 min-h-3.5 w-3.5 min-w-3.5 cursor-pointer appearance-none rounded-full border text-gray-900 transition-all before:absolute before:left-2/4 before:top-2/4 before:block before:h-6 before:w-6 before:-translate-x-2/4 before:-translate-y-2/4 before:animate-pulse before:rounded-full before:opacity-0 before:transition-opacity checked:border-zinc-800 checked:bg-[#ff6060] checked:before:bg-[#ff6060] hover:before:opacity-5 disabled:pointer-events-none`}
                  type="radio"
                  value={answer.isCorrect ? 'true' : 'false'}
                  id={answer.option}
                  disabled={props.formState.status === 'SUCCESS'}
                  name={`answer-${props.test.id}`}
                  defaultChecked={activeIndex === index}
                />
                <Label
                  className="text-sm text-muted-foreground cursor-pointer"
                  label={answer.option}
                  htmlFor={answer.option}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
