import { requireUser } from '@/helpers/requireUser'
import { getPanelOnboardingSeen } from '@/server/companion/getPanelOnboardingSeen'
import PanelWolfekHost from './PanelWolfekHost'

export default async function PanelWolfekSection() {
  const { userId } = await requireUser()
  const initialSeen = await getPanelOnboardingSeen(userId)
  return <PanelWolfekHost userId={userId} initialSeen={initialSeen} />
}
