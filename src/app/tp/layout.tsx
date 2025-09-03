import TeachingPlaygroundNavbar from "./components/TeachingPlaygroundNavbar"
import TeachingPlaygroundSidebar from "./components/TeachingPlaygroundSidebar"

export default function TeachingPlaygroundLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <section className="h-[calc(100vh-6px)] bg-zinc-900 text-zinc-100">
      <TeachingPlaygroundNavbar />
      <div className="flex h-[calc(100vh-73px)]">
        <TeachingPlaygroundSidebar />
        <section className="flex-1 overflow-auto scrollbar-webkit">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </section>
      </div>
    </section>
  )
}
