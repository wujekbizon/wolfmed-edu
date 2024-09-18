import TestsSelection from './_components/TestsSelection'
import Hero from './_components/Hero'
import Contact from './_components/Contact'
import Footer from './_components/Footer'
import { SignedIn } from '@clerk/nextjs'
import Membership from './_components/Membership'

export default function Home() {
  return (
    <section className="w-full h-full flex flex-col items-center">
      <Hero />
      <div className="w-0 h-0 border-solid border-r-[calc(100vw_-_14px)] border-t-transparent border-r-transparent border-b-[10vw] border-b-[#e1b4b4]"></div>
      <TestsSelection />
      <div className="w-0 h-0 border-solid border-r-[calc(100vw_-_14px)] border-t-transparent border-r-[#e1b4b4] border-b-[10vw] border-b-zinc-50">
        {' '}
      </div>
      <Membership />
      <div className="w-0 h-0 border-solid border-l-[calc(100vw_-_14px)] border-t-[10vw] border-t-[#ffafaf] border-l-zinc-800"></div>
      <SignedIn>
        <Contact />
      </SignedIn>
      <div className="w-0 h-0 border-solid border-r-[calc(100vw_-_14px)] border-r-zinc-800 border-b-[10vw] border-b-[#dbd9d9]"></div>
      <Footer />
    </section>
  )
}
