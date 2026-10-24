import SidePanel from '@/app/_components/SidePanel'
import PanelLayoutLoadingContent from './PanelLayoutLoadingContent'
import PanelDashboardSkeleton from './PanelDashboardSkeleton'

export default function PanelLayoutSkeleton() {
  return <>
    <SidePanel isPremium={false} />
    <PanelLayoutLoadingContent dashboard={<PanelDashboardSkeleton />} />
  </>
}
