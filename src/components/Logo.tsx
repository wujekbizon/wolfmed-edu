import Image from 'next/image'
import Link from 'next/link'

export default function Logo() {
  return (
    <Link href="/">
      <div className="flex gap-2 cursor-pointer transition-all hover:shadow-sm hover:scale-95 h-12 items-center px-4 border-2 rounded-full border-red-200/60 bg-[#ffb1b1] shadow-md shadow-zinc-500">
        <div className="h-11 w-11">
          <Image
            className="h-full w-full object-cover"
            src="/blood-test.png"
            alt="blood vial"
            width={80}
            height={80}
            priority
          />
        </div>
        <div className="flex flex-col justify-evenly h-full">
          <h3 className="text-lg font-extrabold leading-3 tracking-wide text-zinc-950">WOLFMED</h3>
          <h3 className="text-base font-semibold text-zinc-500 leading-3">EDUKACJA</h3>
        </div>
      </div>
    </Link>
  )
}
