import TestsSelection from './_components/TestsSelection'
import Hero from './_components/Hero'
import Contact from './_components/Contact'
import Footer from './_components/Footer'

export default function Home() {
  return (
    <section className="w-full h-full flex flex-col items-center">
      <Hero />
      <div className="w-0 h-0 border-solid border-r-[calc(100vw_-_46px)] border-t-transparent border-r-transparent border-b-[10vw] border-b-[#e1b4b4]"></div>
      <TestsSelection />
      <div className="w-0 h-0 border-solid border-l-[calc(100vw_-_24px)] sm:border-l-[calc(100vw_-_46px)] border-t-transparent border-t-[10vw] border-t-[#e1b4b4] border-l-transparent"></div>
      <Contact />
      <div className="w-0 h-0 border-solid border-r-[calc(100vw_-_46px)] border-t-transparent border-r-transparent border-b-[10vw] border-b-[#d9d5d5] mt-[-7vw]"></div>
      <Footer />
    </section>
  )
}
