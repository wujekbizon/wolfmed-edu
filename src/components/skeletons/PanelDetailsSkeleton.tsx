import BadgeWidgetSkeleton from '@/components/BadgeWidgetSkeleton'
import DashboardBillingCardSkeleton from '@/components/skeletons/DashboardBillingCardSkeleton'
import StorageQuotaWidgetSkeleton from '@/components/skeletons/StorageQuotaWidgetSkeleton'
import UserAnalyticsSkeleton from '@/components/skeletons/UserAnalyticsSkeleton'
import UserMottoSkeleton from '@/components/skeletons/UserMottoSkeleton'
import UsernameSkeleton from '@/components/skeletons/UsernameSkeleton'

export default function PanelDetailsSkeleton() {
  return (
    <section className="container mx-auto mt-10 animate-pulse">
      <div className="flex w-full flex-col gap-8 rounded-2xl border border-zinc-200/60 bg-white p-3 shadow-xl shadow-zinc-900/[0.07] xs:p-4 sm:p-10">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <UsernameSkeleton />
          <UserMottoSkeleton />
        </div>
        <UserAnalyticsSkeleton />
        <BadgeWidgetSkeleton />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {[0, 1, 2].map((index) => (
            <div key={index} className="h-32 rounded-xl border border-zinc-100 bg-zinc-50 p-4 sm:p-6" />
          ))}
          <StorageQuotaWidgetSkeleton />
          <DashboardBillingCardSkeleton />
        </div>
      </div>
    </section>
  )
}
