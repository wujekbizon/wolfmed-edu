import Footer from '../_components/Footer'

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export default function PathsLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative">
      {children}
      <Footer />
    </main>
  )
}