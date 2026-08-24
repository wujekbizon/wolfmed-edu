import { SearchX } from 'lucide-react'
import GridProcedureCard from './GridProcedureCard'
import PielegniastwoGridCard from './PielegniastwoGridCard'
import { useState } from 'react'
import type { ProcedureStatus } from '@/types/dataTypes'
import type { ProcedureBrowseItem } from '@/types/procedureBrowseTypes'

export default function ProceduresList({
  procedures,
}: {
  procedures: ProcedureBrowseItem[]
}) {
  const [statuses, setStatuses] = useState<Record<string, ProcedureStatus>>({})

  const handleStatusChange = (id: string, status: ProcedureStatus) => {
    setStatuses(prev => ({ ...prev, [id]: status }))
  }

  if (procedures.length === 0) {
    return (
      <div className='rounded-2xl border border-zinc-200 p-8 text-center text-zinc-500 flex flex-col items-center gap-2'>
        <SearchX className='w-6 h-6 text-zinc-300' />
        Brak procedur dla podanej frazy.
      </div>
    )
  }

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6'>
      {procedures.map((procedure) =>
        procedure.course === 'opiekun-medyczny' ? (
          <GridProcedureCard
            key={procedure.id}
            procedure={{ id: procedure.id, data: procedure.data }}
            procedureSlug={procedure.slug}
            status={statuses[procedure.id] || 'normal'}
            onStatusChange={(status) => handleStatusChange(procedure.id, status)}
          />
        ) : (
          <PielegniastwoGridCard
            key={procedure.id}
            procedure={procedure.data}
            procedureSlug={procedure.slug}
            status={statuses[procedure.id] || 'normal'}
            onStatusChange={(status) => handleStatusChange(procedure.id, status)}
          />
        )
      )}
    </div>
  )
}
