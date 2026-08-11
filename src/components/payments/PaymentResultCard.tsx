import GradientOverlay from '@/components/GradientOverlay'
import LinkButton from '@/components/ui/LinkButton'
import {
  PAYMENT_COURSE_TITLES,
  PAYMENT_RESULT_CONTENT,
} from '@/constants/paymentResult'
import type { PaymentResultCardProps } from '@/types/paymentTypes'

export default function PaymentResultCard({
  result,
  retryHref,
}: PaymentResultCardProps) {
  const content = PAYMENT_RESULT_CONTENT[result.status]
  const verified = 'courseSlug' in result
  const courseTitle = verified ? PAYMENT_COURSE_TITLES[result.courseSlug] : null
  const tier = verified && result.accessTier === 'premium' ? 'Premium' : 'Basic'
  const href = result.status === 'paid'
    ? '/panel'
    : result.status === 'processing' || result.status === 'unavailable'
      ? retryHref
      : verified
        ? `/kierunki/${result.courseSlug}`
        : '/kierunki'
  const action = result.status === 'paid'
    ? 'Rozpocznij naukę'
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
          {verified && (
            <p className="font-medium text-zinc-800">
              {courseTitle} · Plan {tier}
            </p>
          )}
          <LinkButton href={href} size="lg" className="w-full">
            {action}
          </LinkButton>
          {result.status === 'paid' && (
            <LinkButton href="/panel/kursy" variant="secondary" className="w-full">
              Zobacz moje kursy
            </LinkButton>
          )}
        </div>
      </div>
    </section>
  )
}
