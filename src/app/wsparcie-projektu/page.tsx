import ProductDisplay from '@/components/ProductDisplay'

export const dynamic = 'force-static'
export default function MembershipPage() {
  return (
    <section className="min-h-[calc(100vh_-_70px)] bg-gray-100 bg-[url('/member.webp')] bg-no-repeat bg-cover rounded-br-3xl lg:rounded-br-[50px] bg-top rounded-bl-3xl lg:rounded-bl-[50px] p-3 flex flex-col justify-center sm:p-12">
      <div className="relative flex items-center justify-center h-full w-full">
        <ProductDisplay />
      </div>
    </section>
  )
}
