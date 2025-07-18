import ProductDisplay from '@/components/ProductDisplay'
import Image from 'next/image'

export const dynamic = 'force-static'

export default function MembershipPage() {
  return (
    <section className="relative flex items-center justify-center min-h-[calc(100vh-70px)] rounded-br-3xl lg:rounded-br-[50px] rounded-bl-3xl lg:rounded-bl-[50px] p-3 sm:p-12 overflow-hidden">
      <Image
        src="https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5QHAPUHYf6PZ5eKuhFM9REHkAy4n7s3aNYmWi"
        alt="Membership background"
        fill
        priority
        className="object-cover object-top -z-10"
        quality={90}
      />
      <div className="relative flex items-center justify-center h-full w-full">
        <ProductDisplay />
      </div>
    </section>
  )
}
