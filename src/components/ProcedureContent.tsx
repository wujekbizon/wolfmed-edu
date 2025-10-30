'use client'

import { Procedure } from '@/types/dataTypes'
import ProcedureCard from './ProcedureCard'
import Image from 'next/image'

export default function ProcedureContent({
  procedure,
  onClose
}: {
  procedure: Procedure
  onClose: () => void
}) {
  const { name, procedure: procedureText, image } = procedure.data

  return (
    <div className="relative w-full h-full bg-white flex flex-col gap-5 overflow-y-auto p-3 sm:p-6 md:p-10">
      <div className="absolute inset-0">
        <Image
          src={image}
          alt={name}
          width={1200}
          height={800}
          className="w-full h-full object-contain"
          priority
        />
        <div className="absolute inset-0 bg-linear-to-b from-white/20 via-white/60 to-white/80" />
      </div>
      <div className="relative flex-1 z-10 flex border border-zinc-200 p-6 md:p-8 overflow-y-auto scrollbar-webkit max-h-[500px] rounded backdrop-blur-sm bg-white/70">
        <div className="flex flex-col items-start justify-evenly">
          <h2 className="text-xl md:text-2xl font-semibold text-zinc-800 drop-shadow-sm">
            {name}
          </h2>
          <p className="text-zinc-700 text-base md:text-lg leading-relaxed py-4">
            {procedureText}
          </p>
        </div>
      </div>
      <div className="relative z-20 flex-2 flex items-ends justify-center mb-2">
        <ProcedureCard procedure={procedure} />
      </div>
      <div className="relative z-20 flex items-center py-2 justify-center backdrop-blur-sm bg-white/70">
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-full cursor-pointer text-sm font-medium transition-colors bg-zinc-100 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-800"
        >
          Zakończ procedurę
        </button>
      </div>
    </div>
  )
}