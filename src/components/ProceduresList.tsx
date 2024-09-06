import { Procedure } from '@/types/dataTypes'

interface ProceduresListProps {
  procedures: Procedure[]
  isLoading: boolean
  error?: Error | null
}

export default function ProceduresList({ procedures, isLoading, error }: ProceduresListProps) {
  if (isLoading) {
    return <p className="text-center">Loading procedures...</p>
  }

  if (error) {
    return <p className="text-center text-red-500">Error loading procedures: {error.message}</p>
  }

  return (
    <div>
      {procedures.map((procedure) => (
        <p key={procedure.data.name}>{procedure.data.name}</p>
      ))}
    </div>
  )
}
