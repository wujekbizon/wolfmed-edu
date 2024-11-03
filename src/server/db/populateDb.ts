import { db } from '@/server/db/index'
import { procedures, tests, blogPosts, users, completedTestes } from '@/server/db/schema'
import { Post, Procedure, Test, User, CompletedTestData } from '@/types/dataTypes'
import { readFile } from 'node:fs/promises'
import * as path from 'node:path'

async function readDataFileAndParse(fileName: string, folder = 'data', encoding: BufferEncoding = 'utf-8') {
  const filePath = path.join(process.cwd(), folder, fileName)
  const data = await readFile(filePath, encoding)
  return JSON.parse(data)
}

async function insertData<T>(data: T[], table: any, mapToInsertValues: (item: T) => any) {
  for (const item of data) {
    await db.insert(table).values(mapToInsertValues(item))
  }
}

export async function populateTests() {
  try {
    const testsData = (await readDataFileAndParse('tests.json')) as Test[]

    await insertData(testsData, tests, (test) => ({
      id: test.id,
      category: test.category,
      data: test.data,
    }))

    console.log('Tests table populated successfully!')
  } catch (error) {
    console.error('Error populating tests table:', error)
  }
}

export async function populateProcedures() {
  try {
    const proceduresData = (await readDataFileAndParse('procedures.json')) as Procedure[]

    await insertData(proceduresData, procedures, (procedure) => ({
      id: procedure.id,
      data: procedure.data,
    }))

    console.log('Procedures table populated successfully!')
  } catch (error) {
    console.error('Error populating procedures table:', error)
  }
}

export async function populatePosts() {
  try {
    const postsData = (await readDataFileAndParse('blogPosts.json')) as Post[]

    await insertData(postsData, blogPosts, (post) => ({
      title: post.title,
      date: post.date,
      excerpt: post.excerpt,
      content: post.content,
    }))

    console.log('Posts table populated successfully!')
  } catch (error) {
    console.error('Error populating posts table:', error)
  }
}

export async function populateUsers() {
  try {
    const usersData = (await readDataFileAndParse('users.json')) as User[]

    await insertData(usersData, users, (user) => ({
      id: user.id,
      userId: user.userId,
      testLimit: user.testLimit,
      motto: user.motto,
      supporter: user.supporter,
      username: user.username,
      testsAttempted: user.testsAttempted,
      totalScore: user.totalScore,
      totalQuestions: user.totalQuestions,
      createdAt: new Date(user.createdAt),
      updatedAt: user.updatedAt ? new Date(user.updatedAt) : null,
    }))

    console.log('Users table populated successfully!')
  } catch (error) {
    console.error('Error populating users table:', error)
  }
}

export async function populateCompletedTests() {
  try {
    const completedTestsData = (await readDataFileAndParse('completed_tests.json')) as CompletedTestData[]

    await insertData(completedTestsData, completedTestes, (test) => ({
      id: test.id,
      userId: test.userId,
      testResult: test.testResult,
      score: test.score,
      completedAt: test.completedAt ? new Date(test.completedAt) : null,
    }))

    console.log('Completed tests table populated successfully!')
  } catch (error) {
    console.error('Error populating completed tests table:', error)
  }
}
