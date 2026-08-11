import type { CheckoutResultStatus, PaymentOffer } from '@/types/paymentTypes'

export const PAYMENT_RESULT_CONTENT: Record<
  CheckoutResultStatus,
  { title: string; description: string; symbol: string; tone: string }
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

export const PAYMENT_COURSE_TITLES: Record<PaymentOffer['courseSlug'], string> = {
  'opiekun-medyczny': 'Opiekun Medyczny',
  pielegniarstwo: 'Pielęgniarstwo',
}
