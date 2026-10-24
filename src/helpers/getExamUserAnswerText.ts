export function getExamUserAnswerText(answer: string | string[] | undefined): string[] {
  if (Array.isArray(answer)) return answer.map((item) => item.trim()).filter((item) => item.length > 0)
  if (typeof answer === 'string' && answer.trim().length > 0) return [answer.trim()]
  return []
}
