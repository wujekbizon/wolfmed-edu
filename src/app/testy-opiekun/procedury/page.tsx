import AllProcedures from '@/components/AllProcedures'
import { getAllProcedures } from '@/server/queries'
import { Procedure } from '@/types/dataTypes'
import { Metadata } from 'next'

export const dynamic = 'force-static'

export const metadata: Metadata = {
  title: 'Procedury Opiekuna Medycznego',
  description: 'Lista procedur i algorytmów dla opiekuna medycznego',
  keywords: 'opiekun, algorytmy, procedury',
}

export default async function ProceduresPage() {
  const procedures = (await getAllProcedures()) as Procedure[]
  return <AllProcedures procedures={procedures} />
}
