import DynamicBoardSkeleton from '@/components/skeletons/DynamicBoardSkeleton'
import ContinueLearningSkeleton from '@/components/ContinueLearningSkeleton'
import PanelDetailsSkeleton from '@/components/skeletons/PanelDetailsSkeleton'

export default function PanelDashboardSkeleton() {
  return (
    <section aria-label='Wczytywanie panelu' aria-busy='true' className='h-full w-full'>
      <div aria-hidden='true' className='flex h-full w-full flex-col items-center gap-8'>
        <DynamicBoardSkeleton />
        <ContinueLearningSkeleton />
        <PanelDetailsSkeleton />
      </div>
    </section>
  )
}
