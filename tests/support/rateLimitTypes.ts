export type CheckRateLimit = typeof import('@/lib/rateLimit').checkRateLimit
export type LimiterMode = 'old' | 'fixed'

export type LimiterOptions = {
  mode?: LimiterMode
  prefix?: string
  now?: () => number
  onError?: (...args: unknown[]) => void
}

export type TestRedis = {
  zremrangebyscore: (key: string, min: number, max: number) => Promise<unknown>
  zcard: (key: string) => Promise<number>
  zadd: (key: string, entry: { score: number; member: string }) => Promise<unknown>
  expire: (key: string, seconds: number) => Promise<unknown>
  eval: (script: string, keys: string[], args: (number | string)[]) => Promise<number>
}

export type MottoAction = typeof import('@/actions/actions').updateMotto
export type WolfekAction = typeof import('@/actions/rag-actions').askRagQuestion
