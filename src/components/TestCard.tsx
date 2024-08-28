import { LETTERS } from '@/constants/optionsLetters'
import { Test } from '@/types/dataTypes'
import { useState } from 'react'
import Label from './Label'
import { FormState } from '@/types/actionTypes'

export default function TestCard(props: { test: Test; questionNumber: string; formState: FormState }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const {
    data: { answers, question },
  } = props.test

  return (
    <div className="relative flex h-full min-h-80 w-full flex-col justify-between rounded-lg border border-border/40 bg-zinc-950 px-4 py-6 text-white">
      <p className="absolute right-2 top-1 text-sm text-muted-foreground">{props.questionNumber}</p>

      <h3 className="border-b border-border/40 px-4 pb-2 text-base">{question}</h3>
      <div className="flex h-full w-full flex-col gap-1 px-4 pt-4 ">
        {answers.map((answer, index) => {
          return (
            <div
              className={`flex w-full items-center gap-4 rounded-lg px-2 py-1 ${
                (props.formState.status === 'UNSET' || props.formState.status === 'ERROR') && 'hover:bg-zinc-900'
              } ${props.formState.status === 'UNSET' && activeIndex === index && 'bg-zinc-900'} ${
                props.formState.status === 'SUCCESS' &&
                (answer.isCorrect ? 'bg-amber-200/20' : 'bg-black/50 opacity-20')
              }`}
              key={`${answer.option}/${index}`}
            >
              <span className="text-balance text-sm leading-relaxed text-amber-300/40">{LETTERS[index]})</span>
              <input
                className={`${
                  props.formState.status === 'SUCCESS' &&
                  activeIndex === index &&
                  'bg-amber-300/70 before:animate-none before:bg-amber-500'
                }  before:content[''] border-blue-gray-200 before:bg-blue-gray-500 peer relative h-3.5 min-h-3.5 w-3.5 min-w-3.5 cursor-pointer appearance-none rounded-full border text-gray-900 transition-all before:absolute before:left-2/4 before:top-2/4 before:block before:h-6 before:w-6 before:-translate-x-2/4 before:-translate-y-2/4 before:animate-pulse before:rounded-full before:opacity-0 before:transition-opacity checked:border-black checked:bg-amber-300/70 checked:before:bg-amber-500 hover:before:opacity-5 disabled:pointer-events-none`}
                type="radio"
                value={answer.isCorrect ? 'true' : 'false'}
                id={answer.option}
                disabled={props.formState.status === 'SUCCESS'}
                name={`answer-${index}`}
                onClick={() => setActiveIndex(index)}
              />
              <Label className="p-0 text-sm text-muted-foreground" label={answer.option} htmlFor={answer.option} />
            </div>
          )
        })}
      </div>
    </div>
  )
}
