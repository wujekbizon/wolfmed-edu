import Link from 'next/link'

type ExploreLinkProps = {
  text: string
  url: string
  className?: string
}

const ExploreLink = ({ text, url, className }: ExploreLinkProps) => {
  return (
    <Link href={url} className={`w-fit text-xs sm:text-base md:text-lg leading-[190%] tracking-[0.6px] text-red-400 opacity-70 hover:opacity-100 transition-all  ${
        className || ''
      }`}>
      {text} →
    </Link>
  )
}
export default ExploreLink;
