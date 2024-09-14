import GenerateTests from '@/components/GenerateTests'
import { getAllTests } from '@/server/queries'
import { Test } from '@/types/dataTypes'
import { Suspense } from 'react'
import Loading from './loading'

export const dynamic = 'force-static'

async function FetchTests() {
  const tests = (await getAllTests()) as Test[]
  return <GenerateTests tests={tests} />
}

export default function TestsPage() {
  return (
    <Suspense fallback={<Loading />}>
      <FetchTests />
    </Suspense>
  )
}
