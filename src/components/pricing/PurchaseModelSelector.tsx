'use client'

import Switch from '@/components/ui/Switch'
import type { CheckoutPurchaseModel } from '@/types/paymentTypes'

export default function PurchaseModelSelector({
  value,
  onChange,
}: {
  value: CheckoutPurchaseModel
  onChange: (value: CheckoutPurchaseModel) => void
}) {
  const oneTimePayment = value === 'lifetime'

  return (
    <div className="mb-8 flex justify-center">
      <div
        className="inline-flex items-center gap-3 rounded-full border border-rose-100 bg-white/80 px-4 py-3 shadow-sm sm:gap-4"
      >
        <span
          className={`text-sm transition-colors ${
            oneTimePayment ? 'text-zinc-500' : 'font-semibold text-rose-600'
          }`}
        >
          <span className="sm:hidden">Miesięcznie</span>
          <span className="hidden sm:inline">Subskrypcja miesięczna</span>
        </span>
        <Switch
          checked={oneTimePayment}
          onCheckedChange={(checked) => onChange(checked ? 'lifetime' : 'subscription')}
          aria-label={oneTimePayment
            ? 'Wybierz subskrypcję miesięczną'
            : 'Wybierz płatność jednorazową'}
        />
        <span
          className={`text-sm transition-colors ${
            oneTimePayment ? 'font-semibold text-rose-600' : 'text-zinc-500'
          }`}
        >
          <span className="sm:hidden">Jednorazowo</span>
          <span className="hidden sm:inline">Płatność jednorazowa</span>
        </span>
      </div>
    </div>
  )
}
