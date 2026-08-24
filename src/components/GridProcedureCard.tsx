import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import ProcedureStatusControls from '@/components/ProcedureStatusControls'
import type { Procedure, ProcedureStatus } from '@/types/dataTypes'

export default function GridProcedureCard({
  procedure,
  procedureSlug,
  status,
  onStatusChange,
}: {
  procedure: Procedure
  procedureSlug: string
  status: ProcedureStatus
  onStatusChange: (status: ProcedureStatus) => void
}) {
  const { name, procedure: procedureText, image } = procedure.data
  const description = procedureText.slice(0, 120) + (procedureText.length > 120 ? '...' : '')
  const border = status === 'ukończone'
    ? 'border-emerald-700/30'
    : status === 'trudne'
      ? 'border-[#ffa5a5]/40'
      : 'border-zinc-400/60'

  return (
    <div className={`relative group border ${border} bg-white flex flex-col p-4 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden`}>
      <ProcedureStatusControls status={status} onStatusChange={onStatusChange} />

      <div className='aspect-square w-full h-[300px] relative overflow-hidden'>
        <Image
          src={image}
          alt={name}
          width={800}
          height={600}
          className='w-full h-full object-contain'
        />
      </div>

      <div className='flex flex-col grow'>
        <h3 className='text-lg font-bold text-zinc-800 mb-2 line-clamp-2 leading-tight'>{name}</h3>
        <p className='text-zinc-600 text-sm leading-relaxed mb-4 line-clamp-3 grow'>
          {description}
        </p>
        <div className='mt-auto flex justify-end'>
          <Link
            href={`/panel/procedury/opiekun-medyczny/${procedureSlug}`}
            className='inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200 rounded-full transition-all hover:gap-2'
          >
            Rozpocznij procedurę
            <ArrowRight className='w-3.5 h-3.5' />
          </Link>
        </div>
      </div>
    </div>
  )
}
