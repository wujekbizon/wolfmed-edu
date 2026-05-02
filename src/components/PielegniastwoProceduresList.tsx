'use client'

import type { PielegniastwoProcedure } from '@/types/pielegniastwoTypes'
import { getPielegniastwoSlug } from '@/lib/pielegniastwoUtils'
import PielegniastwoGridCard from './PielegniastwoGridCard'

interface Props {
  procedures: PielegniastwoProcedure[]
}

export default function PielegniastwoProceduresList({ procedures }: Props) {
  return (
    <section className="flex flex-col items-center gap-8 px-1 sm:px-4 py-4 w-full h-full">
      <div className="w-full h-full overflow-y-auto p-4 md:p-6 scrollbar-webkit">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
          {procedures.map((procedure) => (
            <PielegniastwoGridCard key={getPielegniastwoSlug(procedure)} procedure={procedure} />
          ))}
        </div>
      </div>
    </section>
  )
}
