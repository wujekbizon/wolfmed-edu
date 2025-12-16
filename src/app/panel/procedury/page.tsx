import AllProcedures from '@/components/AllProcedures'
import { fileData } from '@/server/fetchData'
import { Metadata } from 'next'
import { Suspense } from 'react'

export const metadata: Metadata = {
  title: 'Procedury Opiekuna Medycznego',
  description: 'Lista procedur i algorytmów dla opiekuna medycznego',
  keywords: 'opiekun, algorytmy, procedury',
}

async function ProceduresData() {
  const procedures = await fileData.getAllProcedures()
  return <AllProcedures procedures={procedures} />
}

export default function ProceduresPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <ProceduresData />
    </Suspense>
  )
}
