export function formatStripeReportMoney(amount: number, currency: string): string {
  const formatter = new Intl.NumberFormat('pl-PL', { style: 'currency', currency })
  const digits = ['isk', 'ugx'].includes(currency.toLowerCase())
    ? 2 : formatter.resolvedOptions().maximumFractionDigits ?? 2
  return formatter.format(amount / 10 ** digits)
}
