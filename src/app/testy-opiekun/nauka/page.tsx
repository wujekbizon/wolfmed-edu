import AllTests from '@/components/AllTests'
import { getAllTests } from '@/server/queries'
import { Test } from '@/types/dataTypes'
import { Suspense } from 'react'
import TestLoader from '@/components/TestsLoader'

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
