import GenerateTests from '@/components/GenerateTests'
import { fetchData } from '@/server/fetchData'
import { getAllTests } from '@/server/queries'
import { Test } from '@/types/dataTypes'
import { Suspense } from 'react'

async function FetchTests() {
  // const tests = (await fetchData('tests.json')) as Test[]
  const tests = (await getAllTests()) as Test[]
  return <GenerateTests tests={tests} />
}

export default function TestsPage() {
  return (
    <Suspense fallback={<p className="text-base text-zinc-800">Loading...</p>}>
      <FetchTests />
    </Suspense>
  )
}
