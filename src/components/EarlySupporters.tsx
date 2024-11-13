import { Suspense } from 'react'
import SupportersList from './SupportersList'
import SupportersListSkeleton from '@/components/skeletons/SupportersListSkeleton'

export default async function EarlySupporters() {
  return (
    <section className="w-full py-8 sm:py-16 bg-gradient-to-b from-zinc-100 to-zinc-200">
      <div className="container mx-auto px-4 xs:px-8 relative">
        <div className="animate-fadeInUp text-center">
          <span className="mb-3 sm:mb-4 inline-block rounded-full bg-zinc-200 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-zinc-800">
            Wasze wsparcie
          </span>
          <h2 className="text-2xl sm:text-4xl font-bold text-center mb-8 sm:mb-12 text-zinc-800">
            Pionierzy Platformy
          </h2>
          <p className="text-center text-zinc-600 mb-12 max-w-2xl mx-auto">
            Jesteśmy wdzięczni za wsparcie tych wyjątkowych osób, które pomagają nam rozwijać naszą platformę i wspierać
            edukację medyczną.
          </p>
        </div>
        <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden animate-scaleIn">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50 opacity-50"></div>
          <div className="relative z-10 p-4 sm:p-8 lg:p-12">
            <Suspense fallback={<SupportersListSkeleton />}>
              <SupportersList />
            </Suspense>
          </div>
        </div>
        <div className="mt-12 text-center animate-fadeInUp" style={{ animationDelay: '400ms' }}>
          <p className="text-zinc-600 italic">&quot;Razem tworzymy przyszłość medycyny&quot;</p>
        </div>
      </div>
    </section>
  )
}
