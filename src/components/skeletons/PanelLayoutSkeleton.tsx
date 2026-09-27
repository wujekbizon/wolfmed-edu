import SidePanel from '@/app/_components/SidePanel'
import DynamicBoardSkeleton from '@/components/skeletons/DynamicBoardSkeleton'
import PanelDetailsSkeleton from '@/components/skeletons/PanelDetailsSkeleton'

export default function PanelLayoutSkeleton() {
  return (
    <>
      <SidePanel isPremium={false} enrolledCourseSlugs={['pielegniarstwo']} />
      <div id="scroll-container" className="min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain scrollbar-webkit">
        <div className="py-10">
          <DynamicBoardSkeleton />
          <PanelDetailsSkeleton />
        </div>
      </div>
    </>
  )
}
