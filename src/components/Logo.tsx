import Image from 'next/image'
import Link from 'next/link'

export default function Logo() {
  return (
    <Link href="/" className="z-10">
      <div className="hidden lg:flex gap-3 cursor-pointer items-center transition-all duration-300 hover:opacity-75 hover:scale-[1.02]">
        <div className="h-12 w-12 shrink-0">
          <Image
            className="h-full w-full object-cover"
            src="https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5UOm8ArIxs2k5EyuGdN4SRigYP6qreJDvtVZl"
            alt="blood vial"
            width={80}
            height={80}
            priority
          />
        </div>
        <h3 className="text-xl font-black tracking-wide text-zinc-900 leading-none">
          WOLFMED <span className="font-normal text-zinc-500">EDUKACJA</span>
        </h3>
      </div>
    </Link>
  )
}
