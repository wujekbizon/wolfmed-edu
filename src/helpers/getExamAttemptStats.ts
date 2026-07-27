import type { DiagnozyExamAttempt, ExamAttemptStats } from '@/types/diagnozyTypes'

export function getExamAttemptStats(attempts: DiagnozyExamAttempt[]): ExamAttemptStats {
  if (attempts.length === 0) return { total: 0, best: 0, average: 0, passed: 0 }

  const scores = attempts.map((attempt) => attempt.score)

  return {
    total: attempts.length,
    best: Math.max(...scores),
    average: Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length),
    passed: attempts.filter((attempt) => attempt.passed).length,
  }
}
