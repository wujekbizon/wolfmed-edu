import { Suspense } from 'react'
import BillingOverviewSection from '@/components/billing/BillingOverviewSection'
import LearningPreferencesSection from '@/components/settings/LearningPreferencesSection'
import SettingsSectionSkeleton from '@/components/skeletons/SettingsSectionSkeleton'

export const metadata = {
  title: 'Ustawienia | Wolfmed',
  description: 'Preferencje nauki i ustawienia płatności.',
}

export default function SettingsPage() {
  return (
    <div className="container mx-auto px-3 xs:px-4 sm:px-8 py-6 sm:py-8">
      <div className="max-w-xl space-y-8">
        <Suspense fallback={<SettingsSectionSkeleton />}>
          <LearningPreferencesSection />
        </Suspense>
        <Suspense fallback={<SettingsSectionSkeleton />}>
          <BillingOverviewSection />
        </Suspense>
      </div>
    </div>
  )
}
