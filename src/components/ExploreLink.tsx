import Link from 'next/link'
import { Show } from '@clerk/nextjs'

type ExploreLinkProps = {
  text: string
  url: string
  className?: string
  signedOutOnly?: boolean | undefined
}

const ExploreLink = ({ text, url, className, signedOutOnly }: ExploreLinkProps) => {
  const link = (
    <Link href={url} className={`w-fit text-xs sm:text-base md:text-lg tracking-[0.6px] text-red-400 hover:text-red-500 ${
        className || ''
      }`}>
      {text} 
      <span className='animate-pulse font-extrabold'> →</span>
    </Link>
  )

  return signedOutOnly ? <Show when='signed-out'>{link}</Show> : link
}
export default ExploreLink;
