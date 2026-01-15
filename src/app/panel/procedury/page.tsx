import AllProcedures from '@/components/AllProcedures'
import { getAllProcedures } from '@/server/queries'
import { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Procedury Opiekuna Medycznego',
  description: 'Lista procedur i algorytmów dla opiekuna medycznego',
  keywords: 'opiekun, algorytmy, procedury',
}

export default async function ProceduresPage() {
  const procedures = await getAllProcedures()
  return <AllProcedures procedures={procedures as any} />
}
