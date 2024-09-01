import AllTests from '@/components/AllTests'
import TestLoader from '@/components/TestsLoader'
import { fetchData } from '@/server/fetchData'
import { getAllTests } from '@/server/queries'
import { Test } from '@/types/dataTypes'
import { Suspense } from 'react'

export const dynamic = 'force-static'

async function Tests() {
  const tests = (await fetchData('tests.json')) as Test[]
  // const tests = (await getAllTests()) as Test[]
  return <AllTests tests={tests} />
}

export default function NaukaPage() {
  return (
    <Suspense fallback={<TestLoader />}>
      <Tests />
    </Suspense>
  )
}
