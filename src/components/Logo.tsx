import Image from 'next/image'
import Link from 'next/link'

export default function Logo({ className }: { className: string }) {
  return (
    <Link href="/" className="z-10">
      <div
        className={`${className} hidden lg:flex gap-0 cursor-pointer items-center
          h-11 w-[228px] px-3
          bg-gradient-to-r from-white to-rose-50/50
          border border-rose-200/55 rounded-full
          shadow-[0_2px_14px_rgba(220,80,80,0.10)]
          transition-all duration-300
          hover:shadow-[0_4px_22px_rgba(220,80,80,0.18)] hover:scale-[1.025] hover:border-rose-300/65`}
      >
        <div className="h-10 w-10 shrink-0">
          <Image
            className="h-full w-full object-cover"
            src="https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5UOm8ArIxs2k5EyuGdN4SRigYP6qreJDvtVZl"
            alt="blood vial"
            width={80}
            height={80}
            priority
          />
        </div>

        {/* Visual separator between image and text */}
        <div className="mx-3 h-6 w-px bg-red-200/55 shrink-0" />

        <div className="flex flex-col gap-[3px]">
          <h3 className="text-sm font-black tracking-wider text-zinc-900 leading-none">WOLFMED</h3>
          <h3 className="text-[10px] font-semibold tracking-[0.16em] text-zinc-400 leading-none uppercase">Edukacja</h3>
        </div>
      </div>
    </Link>
  )
}
