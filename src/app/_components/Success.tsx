'use client'

import { createPortalSession } from '@/actions/stripe'
import SubmitButton from '@/components/SubmitButton'
import { useWindowDimensions } from '@/hooks/useWindowsDimensions'

import Link from 'next/link'
import Confetti from 'react-confetti'

export const Success = ({ sessionId }: { sessionId: string }) => {
  const { width, height } = useWindowDimensions()

  return (
    <section className="h-[calc(100vh_-_70px)] bg-gray-100 bg-[url('/member.jpg')] rounded-br-[44px] rounded-bl-[44px] p-6 flex flex-col justify-center sm:p-12">
      <Confetti width={width} height={height} />
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl">
        <div className="p-8">
          <div className="uppercase tracking-wide text-sm text-indigo-600  font-semibold">Sukces!</div>
          <p className="mt-2 text-gray-500">Dziękujemy za zakup premium planu.</p>
          {/* <form action={createPortalSession} className="mt-6">
            <input type="hidden" id="session-id" name="session_id" value={sessionId} />
            <SubmitButton loading="Wczytywanie..." label="Zarządzaj informacjami o subskrypcji" />
          </form> */}
          <Link href="/">
            <p className="text-center text-sm py-3 text-zinc-600 hover:text-zinc-800">Wróc do strony głównej</p>
          </Link>
        </div>
      </div>
    </section>
  )
}
