import ProductDisplay from '@/components/ProductDisplay'


export default function MembershipPage() {
  return (
    <section className="relative flex items-center justify-center min-h-[calc(100vh-80px)] p-3 sm:p-12 overflow-hidden bg-gradient-to-br from-rose-50/30 via-white/60 to-fuchsia-100/40">
      <div className="relative flex items-center justify-center h-full w-full">
        <ProductDisplay />
      </div>
    </section>
  )
}
