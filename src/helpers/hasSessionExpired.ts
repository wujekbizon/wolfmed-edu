export function hasSessionExpired(expiresAt: Date, now = new Date()) {
  return expiresAt.getTime() <= now.getTime()
}
