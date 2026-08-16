import { Suspense } from 'react'
import AdminBlogWidget from '@/components/AdminBlogWidget'
import BadgeWidget from '@/components/BadgeWidget'
import BadgeWidgetSkeleton from '@/components/BadgeWidgetSkeleton'
import DashboardBillingCard from '@/components/billing/DashboardBillingCard'
import MottoForm from '@/components/MottoForm'
import StorageQuotaWidget from '@/components/StorageQuotaWidget'
import TestimonialForm from '@/components/TestimonialForm'
import UserAnalytics from '@/components/UserAnalytics'
import UserMotto from '@/components/UserMotto'
import Username from '@/components/Username'
import UsernameForm from '@/components/UsernameForm'
import DashboardBillingCardSkeleton from '@/components/skeletons/DashboardBillingCardSkeleton'
import StorageQuotaWidgetSkeleton from '@/components/skeletons/StorageQuotaWidgetSkeleton'
import UserAnalyticsSkeleton from '@/components/skeletons/UserAnalyticsSkeleton'
import UserMottoSkeleton from '@/components/skeletons/UserMottoSkeleton'
import UsernameSkeleton from '@/components/skeletons/UsernameSkeleton'
import DynamicBoard from '@/app/_components/DynamicBoard'

export default function PanelDashboard() {
  return (
    <section className="h-full w-full">
      <div className="flex h-full w-full flex-col items-center gap-8">
        <DynamicBoard />
        <section className="container mx-auto">
          <div className="flex w-full flex-col gap-8 rounded-2xl border border-zinc-200/60 bg-white p-3 shadow-xl shadow-zinc-900/[0.07] xs:p-4 sm:p-10">
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <Suspense fallback={<UsernameSkeleton />}>
                <Username />
              </Suspense>
            </div>
            <div className="flex flex-col gap-6 xs:flex-row">
              <Suspense fallback={<UserMottoSkeleton />}>
                <UserMotto />
              </Suspense>
            </div>
            <Suspense fallback={<UserAnalyticsSkeleton />}>
              <UserAnalytics />
            </Suspense>
            <div className="flex flex-col gap-6">
              <Suspense fallback={<BadgeWidgetSkeleton />}>
                <BadgeWidget />
              </Suspense>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <Suspense fallback={null}>
                  <AdminBlogWidget />
                </Suspense>
                <div className="rounded-xl border border-zinc-100 bg-zinc-50 p-4 transition-all duration-200 hover:border-zinc-200 hover:bg-white hover:shadow-sm sm:p-6">
                  <UsernameForm />
                </div>
                <div className="rounded-xl border border-zinc-100 bg-zinc-50 p-4 transition-all duration-200 hover:border-zinc-200 hover:bg-white hover:shadow-sm sm:p-6">
                  <MottoForm />
                </div>
                <div className="rounded-xl border border-zinc-100 bg-zinc-50 p-4 transition-all duration-200 hover:border-zinc-200 hover:bg-white hover:shadow-sm sm:p-6">
                  <TestimonialForm />
                </div>
                <Suspense fallback={<StorageQuotaWidgetSkeleton />}>
                  <StorageQuotaWidget />
                </Suspense>
                <Suspense fallback={<DashboardBillingCardSkeleton />}>
                  <DashboardBillingCard />
                </Suspense>
              </div>
            </div>
          </div>
        </section>
      </div>
    </section>
  )
}
