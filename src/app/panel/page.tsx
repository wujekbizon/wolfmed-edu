
import { Suspense } from "react"
import UsernameForm from "@/components/UsernameForm"
import MottoForm from "@/components/MottoForm"
import UserAnalytics from "@/components/UserAnalytics"
import UserMotto from "@/components/UserMotto"
import UserMottoSkeleton from "@/components/skeletons/UserMottoSkeleton"
import UserAnalyticsSkeleton from "@/components/skeletons/UserAnalyticsSkeleton"
import UsernameSkeleton from "@/components/skeletons/UsernameSkeleton"
import Username from "@/components/Username"
import TestimonialForm from "@/components/TestimonialForm"
import DynamicBoard from "../_components/DynamicBoard"
import StorageQuotaWidget from "@/components/StorageQuotaWidget"
import StorageQuotaWidgetSkeleton from "@/components/skeletons/StorageQuotaWidgetSkeleton"
import BadgeWidget from "@/components/BadgeWidget"
import BadgeWidgetSkeleton from "@/components/BadgeWidgetSkeleton"
import AdminBlogWidget from "@/components/AdminBlogWidget"

export const dynamic = 'force-dynamic'

export default async function TestsPage() {
  return (
    <section className="h-full w-full">
      <div className="w-full h-full flex flex-col items-center gap-8">
        <DynamicBoard />
        <section className="container mx-auto">
          <div className="backdrop-blur-sm w-full gap-8 flex flex-col p-3 xs:-p-4 sm:p-10 rounded-2xl shadow-lg border border-zinc-200/60 transition-all duration-300 bg-linear-to-br from-zinc-50/80 via-rose-50/30 to-zinc-50/80">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <Suspense fallback={<UsernameSkeleton />}>
                <Username />
              </Suspense>
            </div>
            <div className="flex flex-col xs:flex-row gap-6">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Suspense fallback={null}>
                  <AdminBlogWidget />
                </Suspense>
                <div className="bg-white/60 backdrop-blur-sm p-4 sm:p-6 rounded-xl shadow-md border border-zinc-200/60 hover:shadow-lg transition-all duration-300">
                  <UsernameForm />
                </div>
                <div className="bg-white/60 backdrop-blur-sm p-4 sm:p-6 rounded-xl shadow-md border border-zinc-200/60 hover:shadow-lg transition-all duration-300">
                  <MottoForm />
                </div>
                <div className="bg-white/60 backdrop-blur-sm p-4 sm:p-6 rounded-xl shadow-md border border-zinc-200/60 hover:shadow-lg transition-all duration-300">
                  <TestimonialForm />
                </div>
                <Suspense fallback={<StorageQuotaWidgetSkeleton />}>
                  <StorageQuotaWidget />
                </Suspense>
              </div>
            </div>
          </div>
        </section>
      </div>
    </section>
  )
}
