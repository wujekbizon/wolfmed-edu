import Link from 'next/link'

type HeroButtonProps = {
  link: string
  children: React.ReactNode
}

export default function HeroButton({ link, children }: HeroButtonProps) {
  return (
    <Link
      href={link}
      className="bg-red-400 text-base sm:text-lg md:text-xl font-semibold px-7 md:px-10 py-1 md:py-2 rounded-full border border-red-200/40 shadow shadow-zinc-500 hover:border-zinc-800 hover:bg-[#ff5b5b] transition-colors"
    >
      {children}
    </Link>
  )
}
