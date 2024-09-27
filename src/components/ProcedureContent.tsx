'use client'

import { Procedure } from '@/types/dataTypes'
import { useState } from 'react'
import ProcedureCard from './ProcedureCard'

export default function ProcedureContent(props: { procedure: Procedure }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isShowAlgorithm, setIsShowAlgorithm] = useState(false)
  const { algorithm, name, procedure } = props.procedure.data

  const truncatedProcedure = procedure.slice(0, 280) + (procedure.length > 280 ? '...' : '')

  return (
    <div className="border p-5 rounded-lg shadow-md border-red-200/60 bg-white shadow-zinc-500">
      <h2 className="text-2xl mb-2">{name}</h2>
      <p className="text-zinc-700 mb-4">
        {isExpanded ? procedure : truncatedProcedure}{' '}
        <span
          className="text-sm text-red-500/80 cursor-pointer font-semibold"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? 'Pokaż Mniej' : 'Czytaj Więcej'}
        </span>
      </p>
      <button
        className="flex justify-center bg-[#ffc5c5] items-center px-2 py-1 transition-all hover:scale-95 rounded-md border border-red-100/50 hover:border-zinc-900 hover:shadow-sm hover:bg-[#f58a8a] shadow-md shadow-zinc-500"
        onClick={() => setIsShowAlgorithm(!isShowAlgorithm)}
      >
        {isShowAlgorithm ? 'Zwiń Algorytm' : 'Pokaż Algorytm'}
      </button>

      {isShowAlgorithm && (
        <div className="mt-4">
          <ProcedureCard steps={algorithm} />
        </div>
      )}
    </div>
  )
}
