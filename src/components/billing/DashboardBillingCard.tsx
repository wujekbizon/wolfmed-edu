import BillingSummaryList from '@/components/billing/BillingSummaryList'
import LinkButton from '@/components/ui/LinkButton'
import { requireUser } from '@/helpers/requireUser'
import { getBillingOverview } from '@/server/payments/getBillingOverview'

export default async function DashboardBillingCard() {
  const { userId } = await requireUser()
  const overview = await getBillingOverview(userId)

  return (
    <section className="rounded-xl border border-zinc-100 bg-zinc-50 p-4 transition-all duration-200 hover:border-zinc-200 hover:bg-white hover:shadow-sm sm:p-6">
      <h2 className="font-semibold text-zinc-800">Plan i płatności</h2>
      <div className="mt-3">
        <BillingSummaryList overview={overview} />
      </div>
      <LinkButton
        href="/panel/ustawienia#platnosci"
        variant="secondary"
        className="mt-4 w-full"
      >
        Zarządzaj planem i płatnościami
      </LinkButton>
    </section>
  )
}
