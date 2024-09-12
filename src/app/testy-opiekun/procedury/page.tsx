import AllProcedures from '@/components/AllProcedures'
import TestLoader from '@/components/TestsLoader'
import { getAllProcedures } from '@/server/queries'
import { Procedure } from '@/types/dataTypes'
import { Suspense } from 'react'

export const dynamic = 'force-static'

async function Procedures() {
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
