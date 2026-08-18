import type { PricingOfferStatus } from '@/types/paymentTypes'

export const PRICING_OFFER_STATUS_LABELS: Record<PricingOfferStatus, string> = {
  available: 'Kup teraz',
  current_subscription: 'Twój plan',
  portal_upgrade: 'Ulepsz w Stripe',
  downgrade_available: 'Przejdź na Basic',
  scheduled_downgrade: 'Zmiana zaplanowana',
  portal_upgrade_unavailable: 'Zmiana planu wkrótce',
  active_subscription: 'Po zakończeniu subskrypcji',
  owned_lifetime: 'W posiadaniu',
  lifetime_access: 'Masz dostęp na zawsze',
  existing_access: 'Masz już dostęp',
  unavailable: 'Niedostępne',
}
