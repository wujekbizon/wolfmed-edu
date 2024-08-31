import { db } from '@/server/db/index'
import { tests } from '@/server/db/schema'

import { readFile } from 'node:fs/promises'
import * as path from 'node:path'

export async function populateTests() {
  try {
    const dataPath = path.join(process.cwd(), 'data', 'testsNoIds.json')

    const data = await readFile(dataPath, 'utf8')
    const testsData = JSON.parse(data)

    for (const test of testsData) {
      await db.insert(tests).values({
        category: test.category,
        data: test.data,
      })
    }
    console.log('Tests table populated successfully!')
  } catch (error) {
    console.error('Error populating tests table:', error)
  }
}
