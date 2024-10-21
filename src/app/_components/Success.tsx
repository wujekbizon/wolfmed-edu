'use client'

import { useWindowDimensions } from '@/hooks/useWindowsDimensions'
import Link from 'next/link'
import Confetti from 'react-confetti'

export const Success = () => {
  const { width, height } = useWindowDimensions()

  return (
    <section className="min-h-[calc(100vh_-_70px)] bg-transparent p-6 flex flex-col justify-center items-center sm:p-12">
      <Confetti width={width} height={height} />
      <div className="w-full max-w-2xl bg-zinc-50 rounded-3xl shadow-lg border border-zinc-200 overflow-hidden transition-all duration-300 hover:shadow-xl">
        <div className="p-8 sm:p-12">
          <div className="flex flex-col items-center text-center gap-6">
            <div className="bg-white p-4 rounded-full w-20 h-20 flex items-center justify-center shadow-sm">
              <span className="text-green-500 text-4xl font-bold">✓</span>
            </div>
            <h2 className="text-3xl font-bold text-zinc-800">Sukces!</h2>
            <p className="text-xl text-zinc-600 max-w-md">
              Dziękujemy bardzo! Dzięki Twojemu wsparciu możemy dalej rozwijać naszą platformę. Już wkrótce będziemy
              mogli wprowadzić wiele nowych funkcji.
            </p>
            <Link
              href="/"
              className="mt-6 px-6 py-3 bg-zinc-800 text-white rounded-lg font-semibold transition-colors duration-300 hover:bg-zinc-700"
            >
              Wróć do strony głównej
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
