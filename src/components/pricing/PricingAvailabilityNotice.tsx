import Link from 'next/link'
import type {
  CheckoutPurchaseModel,
  PricingOfferStatusMap,
} from '@/types/paymentTypes'

export default function PricingAvailabilityNotice({
  purchaseModel,
  offerStatuses,
}: {
  purchaseModel: CheckoutPurchaseModel
  offerStatuses: PricingOfferStatusMap
}) {
  const statuses = Object.values(offerStatuses)
  const activeSubscription = statuses.includes('active_subscription')
  const lifetimeAccess = statuses.includes('lifetime_access')
  if (purchaseModel === 'lifetime' && activeSubscription) {
    return (
      <p className="mt-5 text-center text-sm text-slate-600">
        Masz aktywną subskrypcję. Dostęp na zawsze kupisz po jej zakończeniu.{' '}
        <Link className="font-medium underline" href="/panel/ustawienia#platnosci">
          Zarządzaj subskrypcją
        </Link>
      </p>
    )
  }
  if (purchaseModel === 'subscription' && lifetimeAccess) {
    return (
      <p className="mt-5 text-center text-sm text-slate-600">
        Masz już dostęp na zawsze, więc subskrypcja tego kierunku nie jest potrzebna.
      </p>
    )
  }
  return null
}
