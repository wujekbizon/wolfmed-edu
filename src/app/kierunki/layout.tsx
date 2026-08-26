import Footer from '../_components/Footer'

export const instant = true

export default function PathsLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative">
      {children}
      <Footer />
    </main>
  )
}
