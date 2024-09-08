import AllProcedures from '@/components/AllProcedures'
import TestLoader from '@/components/TestsLoader'
import { fetchData } from '@/server/fetchData'
import { getAllProcedures } from '@/server/queries'
import { Procedure } from '@/types/dataTypes'
import { Suspense } from 'react'

async function Procedures() {
  // getting procedures from json file , later we could move this to database
  const procedures = (await getAllProcedures()) as Procedure[]

  return <AllProcedures procedures={procedures} />
}

export default function ProceduresPage() {
  return (
    <Suspense fallback={<TestLoader />}>
      <Procedures />
    </Suspense>
  )
}
