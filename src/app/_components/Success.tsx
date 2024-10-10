'use client'

import { useWindowDimensions } from '@/hooks/useWindowsDimensions'

import Link from 'next/link'
import Confetti from 'react-confetti'

export const Success = () => {
  const { width, height } = useWindowDimensions()

  return (
    <section className="h-[calc(100vh_-_70px)] bg-gray-100 bg-[url('/member.webp')] rounded-br-[44px] rounded-bl-[44px] p-6 flex flex-col justify-center sm:p-12">
      <Confetti width={width} height={height} />
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl">
        <div className="p-8">
          <h2 className="uppercase tracking-wide text-sm text-indigo-600  font-semibold">Sukces!</h2>
          <p className="mt-2 text-gray-500">
            Dziękujemy bardzo! Dzieki Twojemu wsparciu możemy dalej rozwijać naszą platformę. Juz wkrótce będziemy mogli
            wprowadzić wiele nowych funkcji.
          </p>
          <Link href="/">
            <p className="text-center text-sm py-3 text-zinc-600 hover:text-zinc-800">Wróc do strony głównej</p>
          </Link>
        </div>
      </div>
    </section>
  )
}
