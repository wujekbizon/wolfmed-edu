'use client'

import { Procedure } from '@/types/dataTypes'
import ProcedureCard from './ProcedureCard'
import Image from 'next/image'
import Link from 'next/link'

export default function ProcedureContent({
  procedure,
  onClose
}: {
  procedure: Procedure
  onClose: () => void
}) {
  const { name, procedure: procedureText, image } = procedure.data

  return (
    <div className="relative w-full h-full bg-white flex flex-col gap-5 overflow-y-auto p-3 sm:p-6 md:p-8">
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
      <div className="relative z-20 flex items-center justify-around flex-col sm:flex-row gap-2 py-2 backdrop-blur-sm bg-white/70">
       
        <Link
          className="flex min-w-[250px] items-center justify-center gap-2 sm:gap-5 bg-red-400 hover:bg-red-500/80 px-2 sm:px-4 py-1 shadow shadow-zinc-500 text-base sm:text-lg rounded-md text-center transition-colors"
          href="/panel/procedury/wyzwania"
        >
         Wyzwanie procedury
        </Link>
     
        <button
          onClick={onClose}
          className="flex min-w-[250px] items-center justify-center cursor-pointer bg-slate-700 text-white hover:bg-slate-800 px-2 sm:px-4 py-1 shadow shadow-zinc-500 text-base sm:text-lg rounded-md text-center transition-colors"
        >
          Zakończ procedurę
        </button>
      </div>
    </div>
  )
}