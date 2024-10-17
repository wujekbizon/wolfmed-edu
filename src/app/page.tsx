import TestsSelection from './_components/TestsSelection'
import Hero from './_components/Hero'
import Contact from './_components/Contact'
import Footer from './_components/Footer'
import Membership from './_components/Membership'
import EarlySupporters from '@/components/EarlySupporters'
import { SignedIn } from '@clerk/nextjs'

export default function Home() {
  return (
    <section className="w-full h-full flex flex-col items-center overflow-x-hidden">
      <Hero />
      <div className="w-0 h-0 border-solid border-r-[calc(100vw_-_6px)] border-t-transparent border-r-transparent border-b-[10vw] border-b-[#e1b4b4]"></div>
      <TestsSelection />
      <div className="w-0 h-0 border-solid border-r-[calc(100vw_-_6px)] border-t-transparent border-r-[#e1b4b4] border-b-[10vw] border-b-zinc-50">
        {' '}
      </div>
      <Membership />
      <div className="w-0 h-0 border-solid border-l-[calc(100vw_-_6px)] border-t-[10vw] border-t-zinc-800 border-l-zinc-100"></div>
      <EarlySupporters />
      <div className="w-0 h-0 border-solid border-l-[calc(100vw_-_6px)] border-t-[10vw] border-t-zinc-200 border-l-zinc-900"></div>
      <SignedIn>
        <Contact />
      </SignedIn>
      <div className="w-0 h-0 border-solid border-r-[calc(100vw_-_6px)] border-r-zinc-900 border-b-[10vw] border-b-zinc-100"></div>
      <div className="w-full h-full ">
        <Footer />
      </div>
    </section>
  )
}
