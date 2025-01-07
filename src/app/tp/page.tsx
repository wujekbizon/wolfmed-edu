import { fileData } from '@/server/fetchData'
import PlaygroundControls from './components/PlaygroundControls'
import { Suspense } from 'react'

export const experimental_ppr = true

export default async function TpPage() {
  const events = await fileData.getAllEvents()

  return (
    <div className="space-y-8">
      <Suspense>
        <PlaygroundControls events={events} />
      </Suspense>
    </div>
  )
}
