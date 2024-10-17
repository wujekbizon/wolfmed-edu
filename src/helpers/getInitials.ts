export function getInitials(username: string): string {
  return username
    .split(/\s+/)
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}
