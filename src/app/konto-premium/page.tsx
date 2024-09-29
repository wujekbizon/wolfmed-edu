'use client'

import { createCheckoutSession } from '@/actions/stripe'
import SubmitButton from '@/components/SubmitButton'
import Image from 'next/image'
import Link from 'next/link'

const ProductDisplay = () => (
  <div className="w-full xs:w-96 bg-white/70 rounded-xl shadow-md shadow-zinc-500">
    <div className="w-full p-8 flex justify-evenly gap-2 flex-col">
      <div className="w-full flex items-center justify-center mb-8">
        <div className="w-16 h-16 border bg-zinc-200 border-zinc-800/25 shadow shadow-zinc-400 rounded-full">
          <Image
            src="/blood-test.png"
            alt="blood icon"
            width={60}
            height={60}
            priority
            className="h-full w-full object-contain"
          />
        </div>
      </div>
      <div className="flex flex-col xs:flex-row items-center justify-between">
        <h2 className="uppercase tracking-wide text-base text-zinc-900 font-bold">Wolfmed Premium Plan</h2>
        <span className="text-lg text-zinc-900 font-bold">49.99zł</span>
      </div>
      <p className="mt-2 text-zinc-500 text-base">
        Uzyskaj dostęp do wszystkich funkcji premium. Płacisz tylko raz, używasz ile chcesz.
      </p>
      <form action={createCheckoutSession} className="mt-10">
        <input type="hidden" name="lookup_key" value="Wolfmed_Premium_Plan-a02a43b" />
        <SubmitButton label="Kup premium" loading={'Zakup w trakcie...'} />
      </form>
      <Link className="w-full py-3" href="/">
        <p className="text-center text-sm text-zinc-600 hover:text-zinc-800">Powrót do strony głównej</p>
      </Link>
    </div>
  </div>
)

export default function MembershipPage() {
  return (
    <section className="h-[calc(100vh_-_70px)] bg-gray-100 bg-[url('/member.jpg')] rounded-br-[44px] rounded-bl-[44px] p-6 flex flex-col justify-center sm:p-12">
      <div className="relative flex items-center justify-center h-full w-full">
        <ProductDisplay />
      </div>
    </section>
  )
}
