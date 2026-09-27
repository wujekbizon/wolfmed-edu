import 'server-only'
export function isPracticeEnabled(category: string) {
  return process.env.LEARNING_PRACTICE_ENABLED === 'true' && !category.startsWith('moje-testy__')
}
