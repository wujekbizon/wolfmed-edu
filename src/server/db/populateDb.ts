import { db } from '@/server/db/index'
import { procedures, tests, blogPosts } from '@/server/db/schema'
import { Post, Procedure, Test } from '@/types/dataTypes'
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
