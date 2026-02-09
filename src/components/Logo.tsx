import Image from 'next/image'
import Link from 'next/link'

export default function Logo({ className }: { className: string }) {
  return (
    <Link href="/" className="z-10">
    <div
      className={`${className} hidden lg:flex gap-6 cursor-pointer transition-all hover:border-[border-red-200/80] hover:shadow-sm hover:scale-95 h-10 py-1 items-center w-[230px] px-4 border rounded-full border-red-200/40  shadow shadow-zinc-500 `}
    >
      <div className="h-12 w-12">
        <Image
          className="h-full w-full object-cover"
          src="https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5UOm8ArIxs2k5EyuGdN4SRigYP6qreJDvtVZl"
          alt="blood vial"
          width={80}
          height={80}
          priority
        />
      </div>
      <div className="flex flex-col justify-around h-full">
        <h3 className="text-lg font-extrabold leading-3 tracking-wide text-zinc-950">WOLFMED</h3>
        <h3 className="text-base font-semibold text-zinc-500 leading-3">EDUKACJA</h3>
      </div>
    </div>
  </Link>
    // <Link href="/" className="z-10 animate-slideInLeft">
    //   <div
    //     className={`${className} hidden py-1 px-2 lg:flex gap-6 h-16 cursor-pointer transition-all duration-200 items-center w-[230px]  rounded-4xl shadow shadow-slate-700/60 hover:border-slate-500 hover:shadow-lg hover:shadow-violet-300/30 hover:translate-y-[-2px] hover:rotate-1 active:translate-y-0 active:rotate-0 group`}
    //   >
    //     <Image
    //       className="h-full w-full object-cover rounded-4xl transition-all duration-200 group-hover:brightness-110 group-hover:contrast-110"
    //       src={Logo1}
    //       alt="Wolfmed Edukacja logo"
    //       width={800}
    //       height={275}
    //       priority
    //     />
    //   </div>
    // </Link>
  )
}
