import GenerateTests from '@/components/GenerateTests'
import { getAllTests } from '@/server/queries'
import { Test } from '@/types/dataTypes'
import { Suspense } from 'react'
import Loading from './loading'
import { Metadata } from 'next'

export const dynamic = 'force-static'

export const metadata: Metadata = {
  title: 'Testy Opiekuna Medycznego',
  description:
    'Darmowa baza testów, oparata na 2 ostatnich latach z egzaminów i kursu MED-14: "Świadczenie usług medyczno-pielęgnacyjnych i opiekuńczych osobie chorej i niesamodzielnej"',
  keywords: 'opiekun, med-14, egzamin, testy, pytania, zagadnienia, medyczno-pielęgnacyjnych, opiekuńczych, baza',
}

async function FetchTests() {
  const tests = (await getAllTests()) as Test[]
  if (!tests || tests.length === 0) {
    return <div>Brak dostępnych testów. Proszę spróbować później.</div>
  }
  return <GenerateTests tests={tests} />
}

export default function TestsPage() {
  return (
    <Suspense fallback={<Loading />}>
      <FetchTests />
    </Suspense>
  )
}
