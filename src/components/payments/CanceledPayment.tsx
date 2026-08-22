import { auth } from '@clerk/nextjs/server'
import Link from 'next/link'
import { getCanceledReturnHref } from '@/helpers/getCanceledReturnHref'
import { cancelCheckoutOrder } from '@/server/payments/cancelCheckoutOrder'
import { CheckoutOrderIdSchema } from '@/server/schema'

export default async function CanceledPayment({
  searchParams,
}: {
  searchParams: Promise<{ course?: string | string[]; order?: string | string[] }>
}) {
  const [{ course, order }, { userId }] = await Promise.all([searchParams, auth()])
  const orderId = CheckoutOrderIdSchema.safeParse(order)

  if (userId && orderId.success) {
    try {
      await cancelCheckoutOrder(orderId.data, userId)
    } catch (error) {
      console.error('Failed to cancel checkout order:', error)
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-70px)] items-center justify-center bg-transparent p-6 sm:p-12">
      <div className="w-full max-w-md rounded-3xl border border-zinc-200 bg-zinc-50 p-8 shadow-lg">
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white p-4 shadow-sm">
            <span className="text-4xl font-bold text-red-600">!</span>
          </div>
          <h1 className="text-3xl font-bold text-zinc-800">Płatność anulowana</h1>
          <p className="text-lg text-zinc-600">
            Twoja płatność została anulowana. Nie zostały naliczone żadne opłaty.
          </p>
          <Link
            href={getCanceledReturnHref(course)}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-800 p-3 font-semibold text-white transition-colors hover:bg-zinc-700"
          >
            <span className="mr-2">&larr;</span>
            Powrót do oferty
          </Link>
        </div>
      </div>
    </div>
  )
}
