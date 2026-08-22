type SessionDetails = {
  category: string
  status: 'ACTIVE' | 'EXPIRED' | 'COMPLETED' | 'CANCELLED'
  expiresAt: Date
}

export function getTestSessionPageState(
  session: SessionDetails | undefined,
  category: string,
  now = new Date()
) {
  if (!session || session.category !== category) return 'INVALID' as const
  if (session.status === 'COMPLETED') return 'COMPLETED' as const
  if (session.status !== 'ACTIVE' || session.expiresAt <= now) return 'INVALID' as const
  return 'ACTIVE' as const
}
