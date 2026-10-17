import { auth } from '@clerk/nextjs/server'
import { getKierunkiWolfekContext } from '@/server/companion/getKierunkiWolfekContext'
import KierunkiWolfekCard from './KierunkiWolfekCard'
import WolfekVisitProvider from './WolfekVisitProvider'

export default async function KierunkiWolfekSection() {
  const { userId } = await auth()
  const context = await getKierunkiWolfekContext(userId)
  return <WolfekVisitProvider key={userId ?? 'anonymous'}><KierunkiWolfekCard context={context} /></WolfekVisitProvider>
}
