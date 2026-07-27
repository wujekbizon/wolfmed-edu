// `crypto.randomUUID` is only exposed in secure contexts, so it is missing when
// the app is served over plain HTTP on a LAN IP (and on Safari < 15.4).
// `getRandomValues` has no such restriction, hence the manual v4 fallback.
export function randomId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    const hex = Array.from(crypto.getRandomValues(new Uint8Array(16)), (byte, index) => {
      const versioned = index === 6 ? (byte & 0x0f) | 0x40 : index === 8 ? (byte & 0x3f) | 0x80 : byte
      return versioned.toString(16).padStart(2, '0')
    }).join('')

    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
  }

  const block = () => Math.random().toString(16).slice(2, 10)
  return `${Date.now().toString(16)}-${block()}-${block()}-${block()}`
}
