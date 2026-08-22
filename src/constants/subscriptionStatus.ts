export const SUBSCRIPTION_STATUS_LABELS: Record<string, string> = {
  active: 'aktywna',
  canceled: 'zakończona',
  incomplete: 'oczekuje',
  incomplete_expired: 'wygasła',
  past_due: 'płatność zaległa',
  paused: 'wstrzymana',
  trialing: 'okres próbny',
  unpaid: 'nieopłacona',
}

export const TERMINAL_SUBSCRIPTION_STATUSES = ['canceled', 'incomplete_expired'] as const
