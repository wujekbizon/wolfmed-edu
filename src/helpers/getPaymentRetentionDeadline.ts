export function getPaymentRetentionDeadline(transactionDate: Date): Date {
  return new Date(Date.UTC(
    transactionDate.getUTCFullYear() + 6,
    11,
    31,
    23,
    59,
    59,
    999
  ))
}
