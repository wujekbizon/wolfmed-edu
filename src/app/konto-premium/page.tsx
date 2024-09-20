'use client'

import { createCheckoutSession } from '@/actions/stripe'
import Logo from '@/components/Logo'
import SubmitButton from '@/components/SubmitButton'
import Link from 'next/link'

const ProductDisplay = () => (
  <div className="w-full xs:w-96 bg-white/70 rounded-xl shadow-md shadow-zinc-500">
    <div className="w-full p-8 flex justify-evenly gap-2 flex-col">
      <div className="w-full flex items-center justify-end mb-14">
        <Logo />
      </div>
      <div className="uppercase tracking-wide text-sm text-indigo-600 font-semibold">Wolfmed Premium Plan</div>
      <div className="block mt-1 text-lg leading-tight font-medium text-black">14.99zł / miesiąc</div>
      <p className="mt-2 text-zinc-500">Uzyskaj dostęp do wszystkich funkcji premium.</p>
      <form action={createCheckoutSession} className="mt-6">
        <input type="hidden" name="lookup_key" value="Wolfmed_Premium_Plan-a02a43b" />
        <SubmitButton label="Zakup premium" loading={'Zakup w trakcie...'} />
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
