'use client'

import { useState } from 'react'
import { cookieCategories } from '@/constants/cookieCategories'
import AboutCookies from './AboutCookies'

type TabType = 'declaration' | 'about'

export default function CookieDetails() {
  const [activeTab, setActiveTab] = useState<TabType>('declaration')
  const [activeCategory, setActiveCategory] = useState<string>(cookieCategories[0]?.id || "")

  const currentCategory = cookieCategories.find((c) => c.id === activeCategory)

  return (
    <div className="rounded-2xl bg-black/20 border border-white/5 overflow-hidden">
      <div className="relative flex border-b border-white/10 bg-white/5">
        <button
          onClick={() => setActiveTab('declaration')}
          className={`relative flex-1 px-5 py-3.5 text-sm font-semibold transition-colors duration-200 ${activeTab === 'declaration'
              ? 'text-white'
              : 'text-zinc-400 hover:text-zinc-300'
            }`}
        >
          <span className="relative z-10">Deklaracja cookies</span>
          {activeTab === 'declaration' && (
            <div className="absolute inset-0 bg-linear-to-r from-zinc-800 to-transparent" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('about')}
          className={`relative flex-1 px-5 py-3.5 text-sm font-semibold transition-colors duration-200 ${activeTab === 'about'
              ? 'text-white'
              : 'text-zinc-400 hover:text-zinc-300'
            }`}
        >
          <span className="relative z-10">O cookies</span>
          {activeTab === 'about' && (
            <div className="absolute inset-0 bg-linear-to-l from-zinc-800 to-transparent" />
          )}
        </button>
        <div
          className="absolute bottom-0 left-0 h-px bg-[#f58a8a] transition-all duration-300 ease-out"
          style={{
            width: '50%',
            transform: activeTab === 'about' ? 'translateX(100%)' : 'translateX(0)'
          }}
        />
      </div>

      <div className="p-5 md:p-6">
        {activeTab === 'declaration' ? (
          <div className="space-y-5">
            <div className="flex flex-wrap gap-2">
              {cookieCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`group relative overflow-hidden px-4 py-2 text-xs font-semibold rounded transition-all duration-300 ${activeCategory === category.id
                      ? 'text-white scale-102 shadow-lg'
                      : 'text-zinc-400 hover:text-white hover:scale-102'
                    }`}
                >
                  {activeCategory === category.id ? (
                    <>
                      <div className="absolute inset-0 bg-linear-to-r from-zinc-700 to-zinc-800" />
                      <span className="relative z-10">{category.label}</span>
                    </>
                  ) : (
                    <>
                      <div className="absolute inset-0 bg-white/5 group-hover:bg-white/10 transition-colors" />
                      <span className="relative z-10">{category.label}</span>
                    </>
                  )}
                </button>
              ))}
            </div>

            {currentCategory && (
              <div className="flex gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="shrink-0 w-8 h-8 rounded-lg bg-zinc-900 border border-white/15 flex items-center justify-center">
                  <svg className="w-4 h-4 text-[#f58a8a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-sm text-zinc-300 leading-relaxed">{currentCategory.description}</p>
              </div>
            )}

            {currentCategory && currentCategory.cookies.length > 0 ? (
              <div className="rounded-xl border border-white/10 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-white/5">
                        <th className="text-left py-3 px-4 text-zinc-400 font-semibold uppercase tracking-wider">Nazwa</th>
                        <th className="text-left py-3 px-4 text-zinc-400 font-semibold uppercase tracking-wider">Dostawca</th>
                        <th className="text-left py-3 px-4 text-zinc-400 font-semibold uppercase tracking-wider">Wygasa</th>
                        <th className="text-left py-3 px-4 text-zinc-400 font-semibold uppercase tracking-wider">Opis</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentCategory.cookies.map((cookie, index) => (
                        <tr
                          key={cookie.name}
                          className={`border-t border-white/5 hover:bg-white/5 transition-colors ${index % 2 === 0 ? 'bg-transparent' : 'bg-white/2'
                            }`}
                        >
                          <td className="py-3 px-4">
                            <code className="text-zinc-200 font-mono text-[11px] bg-zinc-800 px-2 py-1 rounded border border-zinc-600">
                              {cookie.name}
                            </code>
                          </td>
                          <td className="py-3 px-4 text-zinc-300">{cookie.provider}</td>
                          <td className="py-3 px-4">
                            <span className="inline-flex items-center gap-1 text-zinc-400">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {cookie.expiration}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-zinc-400">{cookie.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center mb-3">
                  <svg className="w-6 h-6 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <p className="text-sm text-zinc-500">Brak plików cookie w tej kategorii</p>
              </div>
            )}
          </div>
        ) : (
          <AboutCookies />
        )}
      </div>
    </div>
  )
}
