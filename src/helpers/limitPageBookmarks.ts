const MAX_REMEMBERED_CATEGORIES = 20

// Bookmarks are kept per category and never expire on their own, so the oldest
// entries are dropped once the map grows past the cap. String keys preserve
// insertion order, so the front of the map is the least recently opened.
export function limitPageBookmarks(bookmarks: Record<string, number>): Record<string, number> {
  const keys = Object.keys(bookmarks)
  if (keys.length <= MAX_REMEMBERED_CATEGORIES) return bookmarks

  const kept = keys.slice(keys.length - MAX_REMEMBERED_CATEGORIES)
  return Object.fromEntries(kept.map((key) => [key, bookmarks[key] as number]))
}
