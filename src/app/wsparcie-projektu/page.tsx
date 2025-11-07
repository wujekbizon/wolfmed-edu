import ProductDisplay from '@/components/ProductDisplay'

export const dynamic = 'force-static'

export default function MembershipPage() {
  return (
    <section className="relative flex items-center justify-center min-h-[calc(100vh-80px)] p-3 sm:p-12 overflow-hidden bg-fuchsia-200">
      <div className="relative flex items-center justify-center h-full w-full">
        <ProductDisplay />
      </div>
    </section>
  )
}
