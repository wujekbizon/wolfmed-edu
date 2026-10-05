import 'server-only'
export function isPracticeEnabled(category: string) {
  return !category.startsWith('moje-testy__')
}
