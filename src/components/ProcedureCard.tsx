import { Step } from '@/types/dataTypes'
import { useState } from 'react'

export default function ProcedureCard(props: { steps: Step[] }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [showAll, setShowAll] = useState(false)

  const handleNextStep = () => {
    setCurrentStep((prev) => (prev < props.steps.length - 1 ? prev + 1 : prev))
  }

  const handleShowAll = () => {
    setShowAll(true)
  }

  return (
    <div className="space-y-4">
      {!showAll && (
        <button
          onClick={handleShowAll}
          className="flex justify-center bg-[#ffc5c5] items-center px-2 py-1 transition-all hover:scale-95 rounded-md border border-red-100/50 hover:border-zinc-900 hover:shadow-sm hover:bg-[#f58a8a] shadow-md shadow-zinc-500"
        >
          Pokaż wszystkie kroki
        </button>
      )}
      {showAll
        ? // Map over all steps when showAll is true
          props.steps.map((step, index) => (
            <div
              key={`${step.step}/${index}`}
              className="border border-zinc-700/50 bg-zinc-200 hover:bg-zinc-300 p-4 rounded-lg shadow-md opacity-100 transition-all"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-semibold text-zinc-600">{`Krok ${index + 1}`}</h3>
              </div>
              <p className="mt-2 text-zinc-900 font-semibold text-base">{step.step}</p>
            </div>
          ))
        : // Show step-by-step when showAll is false
          props.steps.map((step, index) => (
            <div
              key={index}
              className={`border border-zinc-700/50 bg-zinc-50 hover:bg-[#ffeeee] p-4 rounded-lg shadow-md transition-all ${
                index <= currentStep ? 'opacity-100' : 'opacity-50'
              } ${index === currentStep ? 'border-zinc-700/80' : ''}`}
            >
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-semibold text-zinc-600">{`Krok ${index + 1}`}</h3>
                {index === currentStep && index < props.steps.length - 1 && (
                  <button
                    onClick={handleNextStep}
                    className="flex justify-center text-zinc-800 hover:text-red-400 font-semibold items-center transition-colors"
                  >
                    Następny krok
                  </button>
                )}
              </div>
              {index <= currentStep && <p className="mt-2 text-zinc-900 font-semibold text-base">{step.step}</p>}
            </div>
          ))}
    </div>
  )
}
