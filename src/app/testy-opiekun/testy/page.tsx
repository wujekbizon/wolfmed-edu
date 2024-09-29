import GenerateTests from '@/components/GenerateTests'
import { getAllTests } from '@/server/queries'
import { Test } from '@/types/dataTypes'
import { Suspense } from 'react'
import Loading from './loading'

export const dynamic = 'force-static'
export const revalidate = 3600

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
