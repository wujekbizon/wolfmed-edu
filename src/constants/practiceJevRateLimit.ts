export const PRACTICE_JEV_RATE_LIMIT = {
  minuteWindowMs: 60_000,
  minuteCalls: 6,
  hourWindowMs: 3_600_000,
  hourCalls: 120,
  windowTtlSeconds: 3600,
  triggerTtlSeconds: 2_592_000,
  cooldownSeconds: 45,
} as const
