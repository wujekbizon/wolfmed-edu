import SidePanel from '@/app/_components/SidePanel'
import DynamicBoardSkeleton from '@/components/skeletons/DynamicBoardSkeleton'
import PanelDetailsSkeleton from '@/components/skeletons/PanelDetailsSkeleton'

export default function PanelLayoutSkeleton() {
  return (
    <>
      <SidePanel isPremium={false} enrolledCourseSlugs={['pielegniarstwo']} />
      <div id="scroll-container" className="flex-1 overflow-y-scroll scrollbar-webkit">
        <div className="py-10">
          <DynamicBoardSkeleton />
          <PanelDetailsSkeleton />
        </div>
      </div>
    </>
  )
}
