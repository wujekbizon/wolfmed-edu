import Link from 'next/link'

type ExploreLinkProps = {
  text: string
  url: string
  className?: string
}

const ExploreLink = ({ text, url, className }: ExploreLinkProps) => {
  return (
    <Link href={url} className={`w-fit text-xs sm:text-base md:text-lg tracking-[0.6px] bg-zinc-50 hover:bg-zinc-900 py-3 px-5 rounded text-red-400 hover:text-red-500 ${
        className || ''
      }`}>
      {text} 
      <span className='animate-pulse font-extrabold'> →</span>
    </Link>
  )
}
export default ExploreLink;
