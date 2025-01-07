import { fileData } from '@/server/fetchData'
import PlaygroundControls from './components/PlaygroundControls'

export default async function TpPage() {
  const events = await fileData.getAllEvents()

  return (
    <div className="space-y-8">
      <PlaygroundControls initialEvents={events} />
    </div>
  )
}
