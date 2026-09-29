import SidePanel from '@/app/_components/SidePanel'
import PanelLayoutLoadingContent from './PanelLayoutLoadingContent'

export default function PanelLayoutSkeleton() {
  return <>
    <SidePanel isPremium={false} enrolledCourseSlugs={['pielegniarstwo']} />
    <PanelLayoutLoadingContent />
  </>
}
