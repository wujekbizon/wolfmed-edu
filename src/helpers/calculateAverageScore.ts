export function calculateAverageScore(totalScore: number, totalQuestions: number): number {
  return totalQuestions > 0 ? (totalScore / totalQuestions) * 100 : 0
}
