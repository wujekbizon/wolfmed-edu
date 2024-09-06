import { Step } from '@/types/dataTypes'
import { useState } from 'react'

export default function ProcedureCard(props: { steps: Step[] }) {
  const [currentStep, setCurrentStep] = useState(0)

  const handleNextStep = () => {
    setCurrentStep((prev) => (prev < props.steps.length - 1 ? prev + 1 : prev))
  }

  return (
    <div className="space-y-4">
      {props.steps.map((step, index) => (
        <div
          key={index}
          className={`border p-4 rounded-lg shadow-md transition-all ${
            index <= currentStep ? 'opacity-100' : 'opacity-50'
          } ${index === currentStep ? 'ring-2 ring-zinc-900' : ''}`}
        >
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold">{`Krok ${index + 1}`}</h3>
            {index === currentStep && index < props.steps.length - 1 && (
              <button
                onClick={handleNextStep}
                className="flex justify-center text-zinc-800 hover:text-red-400 font-semibold items-center transition-colors "
              >
                Następny krok
              </button>
            )}
          </div>
          {index <= currentStep && <p className="mt-2 text-gray-700">{step.step}</p>}
        </div>
      ))}
    </div>
  )
}
