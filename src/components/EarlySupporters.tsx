'use client'

import { mockSupporters, Supporter } from '@/constants/supporters'
import { getInitials } from '@/helpers/getInitials'
import { useRotatingList } from '@/hooks/useRotatingList'

export default function EarlySupporters() {
  const visibleSupporters = useRotatingList<Supporter>(mockSupporters, 6, 10000)

  if (mockSupporters.length === 0) {
    return null
  }

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
            <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 sm:gap-8">
              {visibleSupporters.map((supporter, index) => {
                return (
                  <div
                    key={supporter.id}
                    className={`flex flex-col items-center animate-fadeInUp`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div
                      className={`w-14 h-14 xs:w-16 xs:h-16 sm:w-20 sm:h-20 border border-zinc-400/40 ${
                        index === 0
                          ? 'bg-blue-100'
                          : index === 1
                          ? 'bg-green-100'
                          : index === 2
                          ? 'bg-yellow-100'
                          : index === 3
                          ? 'bg-red-100'
                          : index === 4
                          ? 'bg-purple-100'
                          : index === 5
                          ? 'bg-pink-100'
                          : 'bg-gray-100'
                      } rounded-full flex items-center justify-center text-zinc-600 text-lg xs:text-xl sm:text-3xl font-bold mb-2 sm:mb-3 shadow-md`}
                    >
                      {getInitials(supporter.username)}
                    </div>
                    <p className="text-center text-xs xs:text-sm sm:text-base font-medium text-zinc-700 break-words">
                      {supporter.username}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="mt-12 text-center animate-fadeInUp" style={{ animationDelay: '400ms' }}>
          <p className="text-zinc-600 italic">&quot;Razem tworzymy przyszłość medycyny&quot;</p>
        </div>
      </div>
    </section>
  )
}
