import type {
  CheckoutResultStatus,
  PaymentOffer,
  PaymentResultContent,
  PaymentResultOutcome,
} from '@/types/paymentTypes'

export const PAYMENT_RESULT_CONTENT: Record<
  Exclude<CheckoutResultStatus, 'scheduled'>,
  PaymentResultContent
> = {
  paid: {
    title: 'Płatność potwierdzona',
    description: 'Dostęp został bezpiecznie aktywowany.',
    symbol: '✓',
    tone: 'bg-emerald-50 text-emerald-700',
  },
  processing: {
    title: 'Płatność jest przetwarzana',
    description: 'Stripe nadal potwierdza płatność. Dostęp włączy się automatycznie.',
    symbol: '…',
    tone: 'bg-amber-50 text-amber-700',
  },
  failed: {
    title: 'Płatność nie powiodła się',
    description: 'Dostęp nie został aktywowany. Możesz bezpiecznie spróbować ponownie.',
    symbol: '!',
    tone: 'bg-red-50 text-red-700',
  },
  invalid: {
    title: 'Nie można potwierdzić płatności',
    description: 'Sesja jest nieprawidłowa albo nie należy do zalogowanego konta.',
    symbol: '?',
    tone: 'bg-zinc-100 text-zinc-700',
  },
  unavailable: {
    title: 'Weryfikacja jest chwilowo niedostępna',
    description: 'Nie potwierdzamy jeszcze dostępu. Spróbuj ponownie za chwilę.',
    symbol: '…',
    tone: 'bg-zinc-100 text-zinc-700',
  },
}

export const PAYMENT_SUCCESS_CONTENT: Record<
  PaymentResultOutcome,
  PaymentResultContent
> = {
  lifetime_purchase: {
    title: 'Zakup zakończony',
    description: 'Dostęp do kursu został aktywowany na zawsze.',
    symbol: '✓',
    tone: 'bg-emerald-50 text-emerald-700',
  },
  subscription_purchase: {
    title: 'Subskrypcja jest aktywna',
    description: 'Możesz już korzystać ze wszystkich funkcji swojego planu.',
    symbol: '✓',
    tone: 'bg-emerald-50 text-emerald-700',
  },
  lifetime_upgrade: {
    title: 'Plan Premium jest aktywny',
    description: 'Dostęp Premium został aktywowany na zawsze.',
    symbol: '✓',
    tone: 'bg-emerald-50 text-emerald-700',
  },
  subscription_upgrade: {
    title: 'Plan Premium jest aktywny',
    description: 'Subskrypcja została uaktualniona. Funkcje Premium są już dostępne.',
    symbol: '✓',
    tone: 'bg-emerald-50 text-emerald-700',
  },
  subscription_downgrade: {
    title: 'Plan Basic jest aktywny',
    description: 'Subskrypcja została zmieniona na plan Basic.',
    symbol: '✓',
    tone: 'bg-emerald-50 text-emerald-700',
  },
}

export const PAYMENT_SCHEDULED_CONTENT: PaymentResultContent = {
  title: 'Zmiana planu zaplanowana',
  description: 'Premium pozostaje aktywny do końca opłaconego okresu.',
  symbol: '✓',
  tone: 'bg-emerald-50 text-emerald-700',
}

export const PAYMENT_COURSE_TITLES: Record<PaymentOffer['courseSlug'], string> = {
  'opiekun-medyczny': 'Opiekun Medyczny',
  pielegniarstwo: 'Pielęgniarstwo',
}
