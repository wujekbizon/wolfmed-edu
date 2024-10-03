import AllProcedures from '@/components/AllProcedures'
import { getAllProcedures } from '@/server/queries'
import { Procedure } from '@/types/dataTypes'
import { Suspense } from 'react'
import Loading from './loading'
import { Metadata } from 'next'

export const dynamic = 'force-static'

export const metadata: Metadata = {
  title: 'Procedury Opiekuna Medycznego',
  description: 'Lista procedur i algorytmów dla opiekuna medycznego',
  keywords: 'opiekun, algorytmy, procedury',
}

async function Procedures() {
  const procedures = (await getAllProcedures()) as Procedure[]

  return <AllProcedures procedures={procedures} />
}

export default function ProceduresPage() {
  return (
    <Suspense fallback={<Loading isLoading />}>
      <Procedures />
    </Suspense>
  )
}
