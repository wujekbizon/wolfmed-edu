'use client'

import { useQuery } from '@tanstack/react-query'
import type { PielegniastwoProcedure } from '@/types/pielegniastwoTypes'
import { getPielegniastwoSlug } from '@/lib/pielegniastwoUtils'
import PielegniastwoGridCard from './PielegniastwoGridCard'
import PielegniastwoProceduresListSkeleton from './skeletons/PielegniastwoProceduresListSkeleton'

interface Props {
  procedures: PielegniastwoProcedure[]
}

export default function PielegniastwoProceduresList({ procedures }: Props) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['pielegniastwoProcedures'],
    queryFn: async () => procedures,
    initialData: procedures,
    staleTime: 10 * 60 * 1000,
  })

  return (
    <section className="flex flex-col items-center gap-8 px-1 sm:px-4 py-4 w-full h-full">
      <div className="w-full h-full overflow-y-auto p-4 md:p-6 scrollbar-webkit">
        {isLoading ? (
          <PielegniastwoProceduresListSkeleton />
        ) : error ? (
          <p className="text-sm text-zinc-400 text-center py-12">Nie udało się załadować procedur.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
            {data.map((procedure) => (
              <PielegniastwoGridCard key={getPielegniastwoSlug(procedure)} procedure={procedure} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
