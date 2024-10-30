'use client'

import { useQuery } from '@tanstack/react-query'
import type { Procedure } from '@/types/dataTypes'
import ProceduresList from './ProceduresList'
import Link from 'next/link'
import { useProceduresStore } from '@/store/useProceduresStore'
import { useEffect } from 'react'
import Game from './icons/Game'

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

  useEffect(() => {
    setProcedures(proceduresArr)
  }, [proceduresArr, setProcedures])

  return (
    <section className="flex flex-col items-center gap-8 px-1 sm:px-4 py-4 w-full h-full ">
      <div className="w-full lg:w-3/4 xl:w-2/3 flex">
        <Link
          className="flex items-center justify-between gap-2 sm:gap-5 bg-red-400 hover:bg-red-500 px-4 sm:px-8 py-2 shadow shadow-zinc-500 text-base sm:text-lg rounded-md text-center transition-colors"
          href="/testy-opiekun/procedury/wyzwania"
        >
          <Game width={28} height={28} />
          Wyzwanie losowej procedury
        </Link>
      </div>
      <ProceduresList procedures={procedures} isLoading={isLoading} error={error} />
    </section>
  )
}
