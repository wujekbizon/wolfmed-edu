import GradientOverlay from '@/components/GradientOverlay'
import LinkButton from '@/components/ui/LinkButton'
import {
  PAYMENT_COURSE_TITLES,
  PAYMENT_RESULT_CONTENT,
  PAYMENT_SCHEDULED_CONTENT,
  PAYMENT_SUCCESS_CONTENT,
} from '@/constants/paymentResult'
import { formatPlDate } from '@/helpers/formatPlDate'
import type { PaymentResultCardProps } from '@/types/paymentTypes'

export default function PaymentResultCard({
  result,
  retryHref,
}: PaymentResultCardProps) {
  const content = result.status === 'scheduled'
    ? PAYMENT_SCHEDULED_CONTENT
    : result.status === 'paid'
      ? PAYMENT_SUCCESS_CONTENT[result.outcome]
      : PAYMENT_RESULT_CONTENT[result.status]
  const verified = 'courseSlug' in result
  const courseTitle = verified ? PAYMENT_COURSE_TITLES[result.courseSlug] : null
  const tier = verified && result.accessTier === 'premium' ? 'Premium' : 'Basic'
  const href = result.status === 'paid'
    ? '/panel/nauka'
    : result.status === 'scheduled' && verified
      ? `/kierunki/${result.courseSlug}`
    : result.status === 'processing' || result.status === 'unavailable'
      ? retryHref
      : verified
        ? `/kierunki/${result.courseSlug}`
        : '/kierunki'
  const action = result.status === 'paid'
    ? 'Przejdź do nauki'
    : result.status === 'scheduled'
      ? 'Wróć do kursu'
    : result.status === 'processing' || result.status === 'unavailable'
      ? 'Sprawdź ponownie'
      : result.status === 'failed'
        ? 'Wróć do oferty'
        : 'Zobacz kursy'

  return (
    <section className="relative flex min-h-[calc(100vh-70px)] items-center justify-center p-6 sm:p-12">
      <GradientOverlay />
      <div className="z-20 w-full max-w-md rounded-3xl border border-zinc-200 bg-zinc-50 p-8 shadow-lg">
        <div className="flex flex-col items-center gap-6 text-center">
          <div className={`flex h-20 w-20 items-center justify-center rounded-full text-4xl font-bold ${content.tone}`}>
            {content.symbol}
          </div>
          <h1 className="text-3xl font-bold text-zinc-800">{content.title}</h1>
          <p className="text-lg text-zinc-600">{content.description}</p>
          {result.status === 'scheduled' && (
            <p className="text-sm font-medium text-zinc-700">
              Plan Basic od {formatPlDate(result.effectiveAt)}.
            </p>
          )}
          {verified && (
            <p className="font-medium text-zinc-800">
              {courseTitle} · {result.status === 'scheduled'
                ? 'zmiana na Basic'
                : `Plan ${tier}`}
            </p>
          )}
          <LinkButton href={href} size="lg" className="w-full">
            {action}
          </LinkButton>
        </div>
      </div>
    </section>
  )
}
