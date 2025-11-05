'use client'

import { useQuery } from '@tanstack/react-query'
import type { Procedure } from '@/types/dataTypes'
import ProceduresList from './ProceduresList'
import { useProceduresStore } from '@/store/useProceduresStore'
import { useEffect } from 'react'

export default function AllProcedures(props: { procedures: Procedure[] }) {
  const proceduresArr = Object.values(props.procedures)
  const { setProcedures } = useProceduresStore()

  const {
    data: procedures,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['allProcedures'],
    queryFn: async () => proceduresArr,
    initialData: proceduresArr,
    staleTime: 10 * 60 * 1000,
  })

  // useEffect(() => {
  //   setProcedures(proceduresArr)
  // }, [proceduresArr, setProcedures])

  return (
    <section className="flex flex-col items-center gap-8 px-1 sm:px-4 py-4 w-full h-full ">
      <ProceduresList procedures={procedures} isLoading={isLoading} error={error} />
    </section>
  )
}
