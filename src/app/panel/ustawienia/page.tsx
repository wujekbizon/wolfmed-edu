import { Suspense } from 'react'
import LegacyBillingHashRedirect from '@/components/billing/LegacyBillingHashRedirect'
import LearningPreferencesSection from '@/components/settings/LearningPreferencesSection'
import SettingsSectionSkeleton from '@/components/skeletons/SettingsSectionSkeleton'

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export const metadata = {
  title: 'Ustawienia | Wolfmed',
  description: 'Preferencje nauki.',
}

export default function SettingsPage() {
  return (
    <div className="container mx-auto px-3 xs:px-4 sm:px-8 py-6 sm:py-8">
      <LegacyBillingHashRedirect />
      <div className="max-w-xl">
        <Suspense fallback={<SettingsSectionSkeleton />}>
          <LearningPreferencesSection />
        </Suspense>
      </div>
    </div>
  )
}
