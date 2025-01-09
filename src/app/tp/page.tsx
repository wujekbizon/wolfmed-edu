import { fileData } from '@/server/fetchData'
import PlaygroundControls from './components/PlaygroundControls'
import { Suspense } from 'react'
import { updateLectureStatuses } from '@/helpers/updateLectureStatuses'

export const experimental_ppr = true

export default async function TpPage() {
  const events = await fileData.getAllEvents()
  const updatedEvents = await updateLectureStatuses(events)

  return (
    <div className="space-y-8">
      <Suspense>
        <PlaygroundControls events={updatedEvents} />
      </Suspense>
    </div>
  )
}
