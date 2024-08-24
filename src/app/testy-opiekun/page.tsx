import AllTests from '@/components/AllTests'
import { getTests } from '@/server/getData'
import { Suspense } from 'react'

async function Tests() {
  // getting tests from json file , later we could move this to database
  const tests = await getTests()

  return <AllTests tests={tests} />
}

export default function TestsPage() {
  return (
    <Suspense fallback={<p className="text-base text-zinc-800">Loading...</p>}>
      <Tests />
    </Suspense>
  )
}
