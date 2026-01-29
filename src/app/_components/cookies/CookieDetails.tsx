'use client'

import { useState } from 'react'
import { cookieCategories, CookieCategoryInfo } from '@/constants/cookieCategories'

type TabType = 'declaration' | 'about'

export default function CookieDetails() {
  const [activeTab, setActiveTab] = useState<TabType>('declaration')
  const [activeCategory, setActiveCategory] = useState<string>(cookieCategories[0].id)

  const currentCategory = cookieCategories.find((c) => c.id === activeCategory)

  return (
    <div className="mt-6 border-t border-zinc-700 pt-6">
      {/* Tabs */}
      <div className="flex border-b border-zinc-700 mb-4">
        <button
          onClick={() => setActiveTab('declaration')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'declaration'
              ? 'text-cyan-400 border-b-2 border-cyan-400'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          DEKLARACJA COOKIES
        </button>
        <button
          onClick={() => setActiveTab('about')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'about' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-zinc-400 hover:text-white'
          }`}
        >
          O COOKIES
        </button>
      </div>

      {activeTab === 'declaration' ? (
        <div>
          {/* Category Pills */}
          <div className="flex flex-wrap gap-2 mb-4">
            {cookieCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                  activeCategory === category.id
                    ? 'bg-zinc-700 text-white'
                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>

          {/* Category Description */}
          {currentCategory && (
            <p className="text-xs text-zinc-400 mb-4">{currentCategory.description}</p>
          )}

          {/* Cookie Table */}
          {currentCategory && currentCategory.cookies.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-zinc-700">
                    <th className="text-left py-2 px-2 text-zinc-400 font-medium">Nazwa</th>
                    <th className="text-left py-2 px-2 text-zinc-400 font-medium">Dostawca</th>
                    <th className="text-left py-2 px-2 text-zinc-400 font-medium">Wygasa</th>
                    <th className="text-left py-2 px-2 text-zinc-400 font-medium">Opis</th>
                  </tr>
                </thead>
                <tbody>
                  {currentCategory.cookies.map((cookie) => (
                    <tr key={cookie.name} className="border-b border-zinc-800">
                      <td className="py-2 px-2 text-white font-mono">{cookie.name}</td>
                      <td className="py-2 px-2 text-zinc-300">{cookie.provider}</td>
                      <td className="py-2 px-2 text-zinc-300">{cookie.expiration}</td>
                      <td className="py-2 px-2 text-zinc-400">{cookie.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <AboutCookies />
      )}
    </div>
  )
}

function AboutCookies() {
  return (
    <div className="text-sm text-zinc-300 space-y-4">
      <p>
        Pliki cookie to małe pliki tekstowe, które są umieszczane na Twoim komputerze przez odwiedzane strony
        internetowe. Strony internetowe używają plików cookie, aby pomagać użytkownikom w sprawnej nawigacji i
        wykonywaniu określonych funkcji.
      </p>
      <p>
        Pliki cookie, które są wymagane do prawidłowego działania strony, mogą być ustawiane bez Twojej zgody. Wszystkie
        inne pliki cookie muszą zostać zatwierdzone przed ich ustawieniem w przeglądarce.
      </p>
      <p>
        Możesz zmienić swoją zgodę na wykorzystanie plików cookie w dowolnym momencie na naszej stronie Polityka
        Prywatności.
      </p>
      <p>
        Używamy również plików cookie do zbierania danych w celu personalizacji i mierzenia skuteczności naszych
        działań. Więcej szczegółów znajdziesz w{' '}
        <a
          href="https://policies.google.com/privacy"
          target="_blank"
          rel="noopener noreferrer"
          className="text-cyan-400 hover:text-cyan-300 underline"
        >
          Polityce Prywatności Google
        </a>
        .
      </p>
    </div>
  )
}
