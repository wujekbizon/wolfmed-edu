// Natural order for section numbers like "7.1", "8.10", "20.10": compare the
// chapter and sub-numbers numerically, not lexicographically (which would put
// "10.x" before "7.x" and "8.10" before "8.2").
export function compareDiagnozySection(a: string, b: string): number {
  const pa = a.split('.').map((n) => parseInt(n, 10))
  const pb = b.split('.').map((n) => parseInt(n, 10))
  const len = Math.max(pa.length, pb.length)
  for (let i = 0; i < len; i++) {
    const da = pa[i] ?? 0
    const db = pb[i] ?? 0
    if (da !== db) return da - db
  }
  return 0
}
