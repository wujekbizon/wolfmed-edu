import { createCheckoutSession } from '@/actions/stripe'
import Image from 'next/image'
import SubmitButton from './SubmitButton'
import Link from 'next/link'

export default function ProductDisplay() {
  return (
    <div className="w-full max-w-md bg-white/70 rounded-xl shadow-md shadow-zinc-500">
      <div className="w-full p-4 sm:p-6 md:p-8 flex justify-evenly gap-4 flex-col">
        <div className="w-full flex items-center justify-center mb-4 sm:mb-6">
          <div className="w-14 h-14 sm:w-16 sm:h-16 border bg-zinc-200 border-zinc-800/25 shadow shadow-zinc-400 rounded-full">
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
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-0">
          <h2 className="uppercase tracking-wide text-lg sm:text-xl text-zinc-900 font-bold text-center sm:text-left">
            Wolfmed Donacja
          </h2>
          <span className="text-lg sm:text-xl text-zinc-900 font-bold">49.99zł</span>
        </div>
        <p className="mt-2 text-zinc-500 text-sm sm:text-base text-center sm:text-left">
          Tutaj możesz nas wesprzeć. Twoja pomoc pozwoli dalej budować i rozwijać naszą aplikację.
        </p>
        <form action={createCheckoutSession} className="mt-6 sm:mt-8">
          <SubmitButton label="Wspieram" loading={'Wsparcie w trakcie...'} />
        </form>
        <Link className="w-full py-2 sm:py-3" href="/">
          <p className="text-center text-xs sm:text-sm text-zinc-600 hover:text-zinc-800">Powrót do strony głównej</p>
        </Link>
      </div>
    </div>
  )
}
