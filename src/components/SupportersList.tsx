'use client'

import { getInitials } from '@/helpers/getInitials'
import { mockSupporters, Supporter } from '@/constants/supporters'
import { useRotatingList } from '@/hooks/useRotatingList'

export default function SupportersList() {
  const visibleSupporters = useRotatingList<Supporter>(mockSupporters, 6, 10000)

  if (mockSupporters.length === 0) {
    return null
  }

  return (
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
  )
}
