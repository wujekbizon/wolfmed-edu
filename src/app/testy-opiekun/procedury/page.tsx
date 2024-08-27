import AllProcedures from '@/components/AllProcedures'
import { fetchData } from '@/server/fetchData'
import { Procedure } from '@/types/dataTypes'
import { Suspense } from 'react'

async function Procedures() {
  // getting procedures from json file , later we could move this to database
  const procedures = (await fetchData('procedures.json')) as Procedure[]

  return <AllProcedures procedures={procedures} />
}

export default function ProceduresPage() {
  return (
    <Suspense fallback={<p className="text-base text-zinc-800">Loading...</p>}>
      <Procedures />
    </Suspense>
  )
}
