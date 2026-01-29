'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useCookieConsent } from '@/hooks/useCookieConsent'
import { cookieCategories, CookieCategory } from '@/constants/cookieCategories'
import CookieDetails from './CookieDetails'

export default function CookieConsentBanner() {
  const { showBanner, isLoaded, acceptAll, declineAll, savePreferences } = useCookieConsent()
  const [showDetails, setShowDetails] = useState(false)
  const [preferences, setPreferences] = useState<Record<CookieCategory, boolean>>({
    necessary: true,
    performance: false,
  })

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
    })
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6">
      <div className="max-w-2xl mx-auto bg-zinc-900 rounded-xl shadow-2xl border border-zinc-700">
        <div className="p-4 md:p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <h2 className="text-lg md:text-xl font-semibold text-white">Ta strona używa cookies</h2>
            <button
              onClick={declineAll}
              className="text-zinc-400 hover:text-white transition-colors"
              aria-label="Zamknij"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Description */}
          <p className="text-sm md:text-base text-zinc-300 mb-6">
            Używamy plików cookie, aby poprawić jakość korzystania z naszej strony. Wybierz, na jakie pliki cookie
            wyrażasz zgodę. Więcej informacji znajdziesz w naszej{' '}
            <Link href="/polityka-prywatnosci" className="text-cyan-400 hover:text-cyan-300 underline">
              Polityce prywatności
            </Link>
          </p>

          {/* Cookie Categories */}
          <div className="space-y-3 mb-6">
            {cookieCategories.map((category) => (
              <div key={category.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleToggle(category.id)}
                    disabled={category.required}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      preferences[category.id] || category.required
                        ? 'bg-cyan-500'
                        : 'bg-zinc-600 hover:bg-zinc-500'
                    } ${category.required ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}`}
                    aria-label={`${category.required ? 'Wymagane: ' : ''}${category.label}`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                        preferences[category.id] || category.required ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                    {category.required && (
                      <svg
                        className="absolute top-1 right-1 w-4 h-4 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </button>
                  <span className="text-sm md:text-base text-white font-medium">{category.label.toUpperCase()}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleSave}
              className="flex-1 px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-white font-semibold rounded-full transition-colors"
            >
              ZAPISZ I ZAMKNIJ
            </button>
            <button
              onClick={declineAll}
              className="flex-1 px-6 py-2.5 bg-transparent border border-zinc-500 hover:border-zinc-400 text-white font-semibold rounded-full transition-colors"
            >
              ODRZUĆ WSZYSTKIE
            </button>
          </div>

          {/* Show Details Toggle */}
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="w-full mt-4 flex items-center justify-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {showDetails ? 'UKRYJ SZCZEGÓŁY' : 'POKAŻ SZCZEGÓŁY'}
          </button>

          {/* Details Panel */}
          {showDetails && <CookieDetails />}
        </div>
      </div>
    </div>
  )
}
