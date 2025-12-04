import { Procedure, ProcedureStatus } from '@/types/dataTypes'
import ProcedureModal from './ProcedureModal'
import GridProcedureCard from './GridProcedureCard'
import { useState } from 'react'

interface ProceduresListProps {
  procedures: Procedure[]
  isLoading: boolean
  error?: Error | null
}

export default function ProceduresList({ 
  procedures, 
  isLoading, 
  error 
}: ProceduresListProps) {
  const [statuses, setStatuses] = useState<Record<string, ProcedureStatus>>({})
  const [modalProcedure, setModalProcedure] = useState<Procedure | null>(null)

  const handleStatusChange = (id: string, status: ProcedureStatus) => {
    setStatuses(prev => ({ ...prev, [id]: status }))
  }

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <p className="text-zinc-600 text-lg">Ładowanie procedur...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center py-12">
          <div className="text-6xl mb-4 text-zinc-300">⚠️</div>
          <h3 className="text-xl text-zinc-500 mb-2 font-medium">Błąd ładowania</h3>
          <p className="text-zinc-400">{error.message}</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="w-full h-full overflow-y-auto p-4 md:p-6 scrollbar-webkit">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
          {procedures.map((procedure) => (
            <GridProcedureCard
              key={procedure.id}
              procedure={procedure}
              status={statuses[procedure.id] || 'normal'}
              onStatusChange={(status) => handleStatusChange(procedure.id, status)}
              onOpenModal={() => setModalProcedure(procedure)}
            />
          ))}
        </div>
      </div>
      {modalProcedure && (
        <ProcedureModal
          procedure={modalProcedure}
          onClose={() => setModalProcedure(null)}
        />
      )}
    </>
  )
}
