import Image from 'next/image'
import Link from 'next/link'
import Logo1 from '@/images/Logo1.png'

export default function Logo({ className }: { className: string }) {
  return (
    <Link href="/" className="z-10 animate-slideInLeft">
      <div
        className={`${className} hidden py-1 px-2 lg:flex gap-6 h-16 cursor-pointer transition-all duration-200 items-center w-[230px]  rounded-4xl shadow shadow-slate-700/60 hover:border-slate-500 hover:shadow-lg hover:shadow-violet-300/30 hover:translate-y-[-2px] hover:rotate-1 active:translate-y-0 active:rotate-0 group`}
      >
        <Image
          className="h-full w-full object-cover rounded-4xl transition-all duration-200 group-hover:brightness-110 group-hover:contrast-110"
          src={Logo1}
          alt="Wolfmed Edukacja logo"
          width={800}
          height={275}
          priority
        />
      </div>
    </Link>
  )
}
