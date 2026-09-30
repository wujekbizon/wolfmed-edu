export const COMPANION_JEV_RATE_LIMIT = {
  signedIn: { minuteCalls: 6, hourCalls: 120 },
  anonymous: { minuteCalls: 3, hourCalls: 20 },
  minuteWindowMs: 60_000,
  hourWindowMs: 3_600_000,
  windowTtlSeconds: 3600,
  lockSeconds: 5,
} as const
