import Terms from '@/app/_components/Terms'
import Footer from '@/app/_components/Footer'

export default function WarunkiPage() {
  return (
    <section className="w-full min-h-[calc(100vh_-_70px)] flex flex-col bg-white justify-center rounded-br-3xl lg:rounded-br-[50px] rounded-bl-3xl lg:rounded-bl-[50px]">
      <div className="flex items-center justify-center h-64 bg-zinc-100">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold pt-12 text-center px-4">Warunki użytkowania</h1>
      </div>
      <Terms />
      <Footer />
    </section>
  )
}
