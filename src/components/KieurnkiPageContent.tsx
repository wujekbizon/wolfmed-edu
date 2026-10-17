import { Suspense } from 'react'
import NoCoursesBanner from '@/components/NoCoursesBanner'
import NoCoursesBannerSkeleton from '@/components/skeletons/NoCoursesBannerSkeleton'
import KierunkiLandingHero from '@/components/KierunkiLandingHero'
import KierunkiCourseCatalog from '@/components/KierunkiCourseCatalog'
import KierunkiWolfekSection from '@/components/wolfek/KierunkiWolfekSection'
import KierunkiWolfekSkeleton from '@/components/skeletons/KierunkiWolfekSkeleton'

export default function KierunkiPageContent() {
  return <section className="kierunki-landing">
    <div className="kierunki-landing-shell">
      <Suspense fallback={<NoCoursesBannerSkeleton />}>
        <NoCoursesBanner />
      </Suspense>
      <KierunkiLandingHero />
      <div className="kierunki-landing-grid">
        <Suspense fallback={<KierunkiWolfekSkeleton />}>
          <KierunkiWolfekSection />
        </Suspense>
        <KierunkiCourseCatalog />
      </div>
    </div>
  </section>
}
