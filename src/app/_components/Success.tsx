'use client'

import { FloatingShapes } from '@/components/FloatingShapes'
import GradientOverlay from '@/components/GradientOverlay'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { careerPathsData } from '@/constants/careerPathsData'

export const Success = () => {
  const searchParams = useSearchParams()
  const courseSlug = searchParams.get('courseSlug')
  const tier = searchParams.get('tier') || 'basic'

  const courseData = courseSlug ? careerPathsData[courseSlug] : null
  const tierData = courseData?.pricing?.[tier as 'basic' | 'premium' | 'pro']

  const isPremium = tier === 'premium'

  if (!courseData || !tierData) {
    return (
      <section className="relative min-h-[calc(100vh-80px)] p-6 flex flex-col justify-center items-center sm:p-12">
        <GradientOverlay />
        <FloatingShapes count={10} />
        <div className="w-full max-w-2xl bg-white z-20 rounded-3xl shadow-xl ring-2 ring-slate-900/10 overflow-hidden">
          <div className="p-8 sm:p-12">
            <div className="flex flex-col items-center text-center gap-6">
              <div className="bg-zinc-50 p-4 rounded-full w-20 h-20 flex items-center justify-center shadow-sm">
                <svg
                  className="w-10 h-10 text-[#f58a8a]"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900">Płatność zakończona!</h2>
              <p className="text-lg text-zinc-600 max-w-md">
                Dziękujemy za zakup. Twój dostęp został aktywowany.
              </p>
              <Link
                href="/panel"
                className="mt-6 px-8 py-3 bg-slate-900 text-white rounded-lg font-semibold transition-all duration-300 hover:bg-slate-800 shadow-sm hover:shadow-md"
              >
                Rozpocznij naukę
              </Link>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="relative min-h-[calc(100vh-80px)] p-6 flex flex-col justify-center items-center sm:p-12">
    <GradientOverlay />
    <FloatingShapes count={10} />
    <div
      className={`
        w-full max-w-2xl bg-white z-20 rounded-3xl overflow-hidden transition-all duration-300
        ${
          isPremium
            ? 'ring-2 ring-slate-900/10 shadow-xl'
            : 'ring-1 ring-zinc-200 shadow-lg'
        }
      `}
    >
      <div className="p-8 sm:p-12">
        <div className="flex flex-col items-center text-center gap-6">
          <span
            className={`
              text-[11px] font-semibold self-end tracking-wide px-3 py-1.5 rounded
              ${
                isPremium
                  ? 'bg-slate-900/5 text-slate-700'
                  : 'bg-zinc-100 text-zinc-700'
              }
            `}
          >
            Plan {isPremium ? 'Premium' : 'Basic'}
          </span>

          <div
            className={`
              p-5 rounded-full w-24 h-24 flex items-center justify-center shadow-sm
              ${isPremium ? 'bg-[#ffc5c5]/20' : 'bg-zinc-50'}
            `}
          >
            <svg
              className={`w-12 h-12 ${isPremium ? 'text-[#f58a8a]' : 'text-slate-500'}`}
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
            Witaj w kursie {courseData.title}
          </h2>

          <p className="text-lg text-zinc-600">
            Właśnie odblokowałeś dostęp do:
          </p>

          <ul className="w-full max-w-md space-y-3 text-left mt-4">
            {tierData.features.slice(0, 4).map((feature, i) => (
              <li key={i} className="flex items-start gap-3 text-sm md:text-base text-zinc-700">
                <svg
                  className="mt-0.5 w-5 h-5 md:w-6 md:h-6 shrink-0 text-slate-500"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md mt-8">
            <Link
              href="/panel"
              className="flex-1 px-6 py-3 bg-slate-900 text-white rounded-lg font-semibold transition-all duration-300 hover:bg-slate-800 shadow-sm hover:shadow-md text-center"
            >
              Rozpocznij naukę
            </Link>
            <Link
              href="/panel/kursy"
              className="flex-1 px-6 py-3 bg-white text-slate-700 ring-1 ring-zinc-200 rounded-lg font-semibold transition-all duration-300 hover:bg-zinc-50 shadow-sm hover:shadow-md text-center"
            >
              Zobacz moje kursy
            </Link>
          </div>
        </div>
      </div>
    </div>
  </section>
  )
}
