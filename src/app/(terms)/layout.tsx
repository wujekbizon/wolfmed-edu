import Footer from '@/app/_components/Footer'

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return (
    <section className="w-full min-h-[calc(100vh-70px)] flex flex-col bg-white justify-center rounded-br-3xl lg:rounded-br-[50px] rounded-bl-3xl lg:rounded-bl-[50px]">
      {children}
      <Footer />
    </section>
  )
}
