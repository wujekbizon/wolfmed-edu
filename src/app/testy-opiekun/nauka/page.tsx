import AllTests from '@/components/AllTests'
import TestLoader from '@/components/TestsLoader'
import { getAllTests } from '@/server/queries'
import { Test } from '@/types/dataTypes'
import { Suspense } from 'react'

export const dynamic = 'force-static'

async function Tests() {
  const tests = (await getAllTests()) as Test[]
  return <AllTests tests={tests} />
}

export default function NaukaPage() {
  return (
    <Suspense fallback={<TestLoader />}>
      <Tests />
    </Suspense>
  )
}
