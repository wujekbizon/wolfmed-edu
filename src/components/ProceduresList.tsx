import { Procedure } from '@/types/dataTypes'
import ProcedureContent from './ProcedureContent'

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
    <div className="w-full lg:w-3/4 xl:w-2/3 flex flex-col gap-6 py-2 pr-2 overflow-y-auto scrollbar-webkit">
      {procedures.map((procedure) => (
        <ProcedureContent key={procedure.id} procedure={procedure} />
      ))}
    </div>
  )
}
