import type { db } from '@/server/db/index'
import type { learningPracticeSessions } from '@/server/db/schema'
import type { TestData } from './dataTypes'

export type PracticeTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0]
export type PracticeSession = typeof learningPracticeSessions.$inferSelect
export type PracticeQuestion = { id: string; revision: string; data: TestData }
