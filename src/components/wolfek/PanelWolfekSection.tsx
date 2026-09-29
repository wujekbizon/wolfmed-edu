import { requireUser } from '@/helpers/requireUser'
import { getPanelOnboardingSeen } from '@/server/companion/getPanelOnboardingSeen'
import type { PanelWolfekRoute } from '@/types/panelWolfekTypes'
import PanelWolfekHost from './PanelWolfekHost'

export default async function PanelWolfekSection({ route = 'panel.home' }: { route?: PanelWolfekRoute }) {
  const { userId } = await requireUser()
  const initialSeen = await getPanelOnboardingSeen(userId)
  return <PanelWolfekHost userId={userId} initialSeen={initialSeen} route={route} />
}
