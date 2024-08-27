'use client'

import { useQuery } from '@tanstack/react-query'
import { Procedure } from '@/types/dataTypes'
import ProceduresList from './ProceduresList'

export default function AllProcedures(props: { procedures: Procedure[] }) {
  // creates an array directly from object's values
  const proceduresArr = Object.values(props.procedures)

  const {
    data: procedures,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['allProcedures'],
    queryFn: async () => proceduresArr,
    initialData: proceduresArr,
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
  })

  return (
    <section className="flex flex-col items-center gap-8 px-1 sm:px-4 w-full h-full overflow-y-auto scrollbar-webkit">
      <ProceduresList procedures={procedures} isLoading={isLoading} error={error} />
    </section>
  )
}
