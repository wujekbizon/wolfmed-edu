export const getQuestionWord = (count: number): string => {
  if (count === 0) return 'pytań'
  if (count === 1) return 'pytanie'
  if (count >= 2 && count <= 4) return 'pytania'
  if (count >= 5 && count <= 21) return 'pytań'
  const lastDigit = count % 10
  if (lastDigit >= 2 && lastDigit <= 4) return 'pytania'
  return 'pytań'
}
