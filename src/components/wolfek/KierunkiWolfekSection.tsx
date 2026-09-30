import { auth } from '@clerk/nextjs/server'
import { getKierunkiWolfekContext } from '@/server/companion/getKierunkiWolfekContext'
import KierunkiWolfekCard from './KierunkiWolfekCard'

export default async function KierunkiWolfekSection() {
  const { userId } = await auth()
  const context = await getKierunkiWolfekContext(userId)
  return <KierunkiWolfekCard context={context} />
}
