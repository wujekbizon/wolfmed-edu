'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useCookieConsentStore } from '@/store/useCookieConsentStore'
import { cookieCategories, CookieCategory } from '@/constants/cookieCategories'
import CookieDetails from './CookieDetails'

export default function CookieConsentBanner() {
  const {
    consent,
    showBanner,
    isLoaded,
    initialize,
    declineAll,
    savePreferences
  } = useCookieConsentStore()

  const [showDetails, setShowDetails] = useState(false)
  const [preferences, setPreferences] = useState<Record<CookieCategory, boolean>>({
    necessary: true,
    performance: false,
    marketing: false,
  })

  // Initialize store on mount
  useEffect(() => {
    initialize()
  }, [initialize])

  // Pre-fill preferences with current consent when banner opens
  useEffect(() => {
    if (showBanner && consent) {
      setPreferences({
        necessary: true,
        performance: consent.performance,
        marketing: consent.marketing,
      })
    }
  }, [showBanner, consent])

  if (!isLoaded || !showBanner) return null

  const handleToggle = (category: CookieCategory) => {
    if (category === 'necessary') return
    setPreferences((prev) => ({
      ...prev,
      [category]: !prev[category],
    }))
  }

  const handleSave = () => {
    savePreferences({
      performance: preferences.performance,
      marketing: preferences.marketing,
    })
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-3 md:p-6 animate-slideInUp">
      <div className="max-w-4xl mx-auto">
        <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-zinc-900 via-zinc-950 to-black backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/50">
         
          <div className="relative p-5 md:p-7">
            <div className="flex items-start justify-between gap-4 mb-5">
              <div className="flex items-center gap-3">
                <div className="shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-zinc-900 border border-white/15 flex items-center justify-center">
                  <svg className="w-5 h-5 md:w-6 md:h-6 text-[#f58a8a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg md:text-xl font-bold text-white tracking-tight">Prywatność i cookies</h2>
                  <p className="text-xs md:text-sm text-zinc-400 mt-0.5">Dbamy o Twoją prywatność</p>
                </div>
              </div>
              <button
                onClick={declineAll}
                className="shrink-0 w-8 h-8 md:w-9 md:h-9 rounded-xl hover:bg-white/5 text-zinc-400 hover:text-white transition-all duration-200 flex items-center justify-center group"
                aria-label="Zamknij"
              >
                <svg className="w-5 h-5 transition-transform group-hover:rotate-90 duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <p className="text-sm md:text-base text-zinc-300 leading-relaxed mb-6">
              Używamy plików cookie, aby poprawić jakość korzystania z naszej strony. Możesz wybrać, 
              które pliki cookie akceptujesz.{' '}
              <Link 
                href="/polityka-prywatnosci" 
                className="text-[#f58a8a] hover:text-[#f9a7a7] underline underline-offset-2 decoration-[#f9a7a7]/30 hover:decoration-[#f9a7a7]/50 transition-colors inline-flex items-center gap-1"
              >
                Polityka prywatności
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </p>

            <div className="space-y-3 mb-6">
              {cookieCategories.map((category) => (
                <div 
                  key={category.id} 
                  className="group relative overflow-hidden rounded-2xl bg-white/5 hover:bg-white/8 border border-white/10 hover:border-white/20 transition-all duration-300 p-4"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm md:text-base font-semibold text-white">
                          {category.label}
                        </span>
                        {category.required && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-500/30 text-xs font-medium text-[#f58a8a]">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Wymagane
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-400 line-clamp-2">{category.description}</p>
                    </div>
                    
                    <button
                      onClick={() => handleToggle(category.id)}
                      disabled={category.required}
                      className={`relative shrink-0 w-14 h-8 rounded-full transition-all duration-300 ${
                        preferences[category.id] || category.required
                          ? 'bg-linear-to-r from-[#f58a8a] to-[#ffc5c5] border-red-200/60'
                          : 'bg-zinc-700 hover:bg-zinc-600'
                      } ${category.required ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}
                      aria-label={`${category.required ? 'Wymagane: ' : ''}${category.label}`}
                    >
                      <span
                        className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-lg transition-all duration-300 flex items-center justify-center ${
                          preferences[category.id] || category.required ? 'translate-x-6' : 'translate-x-0'
                        }`}
                      >
                        {(preferences[category.id] || category.required) && (
                          <svg className="w-3 h-3 text-rose-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <button
                onClick={handleSave}
                className="group relative overflow-hidden px-6 py-3.5 rounded-2xl font-semibold text-zinc-900 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
              >
                <div className="absolute inset-0 bg-linear-to-r from-[#f58a8a] to-[#ffc5c5] transition-opacity group-hover:opacity-90" />
                <div className="absolute inset-0 bg-linear-to-r from-[#f58a8a] to-[#ffc5c5] opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="relative flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Zapisz preferencje
                </span>
              </button>
              
              <button
                onClick={declineAll}
                className="group relative overflow-hidden px-6 py-3.5 rounded-2xl font-semibold border border-white/20 hover:border-white/30 text-white transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] hover:bg-white/5"
              >
                <span className="relative flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Odrzuć wszystkie
                </span>
              </button>
            </div>

            <button
              onClick={() => setShowDetails(!showDetails)}
              className="w-full group flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition-all duration-200"
            >
              <svg 
                className={`w-4 h-4 transition-transform duration-300 ${showDetails ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              {showDetails ? 'Ukryj szczegóły' : 'Pokaż szczegóły'}
            </button>
            <div 
              className={`transition-all duration-300 ease-in-out ${
                showDetails 
                  ? 'max-h-[800px] opacity-100 mt-4' 
                  : 'max-h-0 opacity-0 overflow-hidden'
              }`}
            >
              <CookieDetails />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}