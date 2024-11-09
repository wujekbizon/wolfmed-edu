import Link from 'next/link'

type HeroButtonProps = {
  link: string
  children: React.ReactNode
}

export default function HeroButton({ link, children }: HeroButtonProps) {
  return (
    <Link
      href={link}
      className="inline-block relative bg-gradient-to-r from-red-400 to-red-500 text-white text-base sm:text-lg md:text-xl font-semibold px-8 md:px-12 py-2.5 md:py-3.5 rounded-full shadow-lg shadow-red-400/30 border border-red-300/20 transition-all duration-300 ease-out hover:shadow-xl hover:shadow-red-400/40 hover:scale-105 hover:border-red-300/30 active:scale-95 before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/10 before:to-transparent before:rounded-full before:opacity-0 hover:before:opacity-100 before:transition-opacity overflow-hidden"
    >
      {children}
    </Link>
  )
}
