import questions from '@/content/wolfek/questions.json'
import type { WolfekRoute } from '@/types/wolfekResponseTypes'

export function getWolfekPreparedQuestion(route: WolfekRoute, id: string) {
  return questions[route].find((button) => button.id === id) ?? null
}
