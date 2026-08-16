import BillingPortalButton from '@/components/billing/BillingPortalButton'
import BillingSummaryList from '@/components/billing/BillingSummaryList'
import { requireUser } from '@/helpers/requireUser'
import { getBillingOverview } from '@/server/payments/getBillingOverview'

export default async function BillingOverviewSection() {
  const { userId } = await requireUser()
  const overview = await getBillingOverview(userId)
  const hasSubscriptions = overview.subscriptions.length > 0

  return (
    <section
      id="platnosci"
      className="scroll-mt-6 rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6"
    >
      <h2 className="text-lg font-semibold text-zinc-800">Płatności</h2>
      <div className="mt-4">
        <BillingSummaryList overview={overview} />
      </div>
      {hasSubscriptions && <BillingPortalButton />}
    </section>
  )
}
