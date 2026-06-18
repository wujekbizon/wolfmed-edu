'use client'

import { useQuery } from '@tanstack/react-query'
import type { PielegniastwoProcedure } from '@/types/pielegniastwoTypes'
import { getPielegniastwoSlug } from '@/lib/pielegniastwoUtils'
import PielegniastwoGridCard from './PielegniastwoGridCard'

interface Props {
  procedures: PielegniastwoProcedure[]
}

function GridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="border border-zinc-200 rounded-2xl overflow-hidden animate-pulse">
          <div className="h-[320px] bg-zinc-100" />
          <div className="p-4 flex flex-col gap-3">
            <div className="h-4 bg-zinc-100 rounded w-3/4" />
            <div className="h-3 bg-zinc-100 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
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
          <GridSkeleton />
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
