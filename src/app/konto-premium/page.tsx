'use client'

import ProductDisplay from '@/components/ProductDisplay'

export const dynamic = 'force-static'
export default function MembershipPage() {
  return (
    <section className="h-[calc(100vh_-_70px)] bg-gray-100 bg-[url('/member.webp')] rounded-br-[44px] rounded-bl-[44px] p-6 flex flex-col justify-center sm:p-12">
      <div className="relative flex items-center justify-center h-full w-full">
        <ProductDisplay />
      </div>
    </section>
  )
}
