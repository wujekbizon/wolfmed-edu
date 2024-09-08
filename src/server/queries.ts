import 'server-only'
import { db } from '@/server/db/index'
import { ExtendedCompletedTest, ExtendedProcedures, ExtendedTest } from '@/types/dataTypes'
import { cache } from 'react'

export const getAllTests = cache(async (): Promise<ExtendedTest[]> => {
  const tests = await db.query.tests.findMany({
    orderBy: (model, { desc }) => desc(model.id),
  })

  return tests
})

export const getAllProcedures = cache(async (): Promise<ExtendedProcedures[]> => {
  const procedures = await db.query.procedures.findMany({
    orderBy: (model, { desc }) => desc(model.id),
  })

  return procedures
})

export const getCompletedTestsByUser = cache(async (userId: string): Promise<ExtendedCompletedTest[]> => {
  const completedTest = await db.query.completedTestes.findMany({
    where: (model, { eq }) => eq(model.userId, userId),
    orderBy: (model, { desc }) => desc(model.completedAt),
  })

  return completedTest
})

export const getCompletedTest = cache(async (testId: string) => {
  const completedTest = await db.query.completedTestes.findFirst({
    where: (model, { eq }) => eq(model.id, testId),
  })

  return completedTest
})

export const getQuestionById = cache(async (testId: string) => {
  const question = await db.query.tests.findFirst({
    where: (model, { eq }) => eq(model.id, testId),
  })

  return question
})
