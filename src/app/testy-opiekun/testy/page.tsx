import GenerateTests from '@/components/GenerateTests'
import { fetchData } from '@/server/fetchData'
import { Test } from '@/types/dataTypes'
import { Suspense } from 'react'

async function FetchTests() {
  // getting tests from json file , later we could move this to database
  const tests = (await fetchData('tests.json')) as Test[]
  return <GenerateTests tests={tests} />
}

export default function TestsPage() {
  return (
    <Suspense fallback={<p className="text-base text-zinc-800">Loading...</p>}>
      <FetchTests />
    </Suspense>
  )
}
