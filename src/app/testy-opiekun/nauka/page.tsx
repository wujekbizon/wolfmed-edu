import AllTests from '@/components/AllTests'
import { fetchData } from '@/server/fetchData'
import { Test } from '@/types/dataTypes'
import { Suspense } from 'react'

async function Tests() {
  // getting tests from json file , later we could move this to database
  const tests = (await fetchData('tests.json')) as Test[]

  return <AllTests tests={tests} />
}

export default function NaukaPage() {
  return (
    <Suspense fallback={<p className="text-base text-zinc-800">Loading...</p>}>
      <Tests />
    </Suspense>
  )
}
