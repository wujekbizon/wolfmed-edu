export const COMPANION_JEV_RATE_LIMIT = {
  signedIn: { minuteCalls: 60, hourCalls: 600 },
  anonymous: { minuteCalls: 12, hourCalls: 120 },
  minuteWindowMs: 60_000,
  hourWindowMs: 3_600_000,
  windowTtlSeconds: 3600,
  lockSeconds: 5,
} as const
