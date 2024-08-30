import { readFileSync, writeFileSync } from 'node:fs'
import { v4 as uuidv4 } from 'uuid'
import * as path from 'node:path'
import { Test } from './src/types/dataTypes'

const dataPath = path.join(process.cwd(), 'data', 'tests.json')
const testsData = JSON.parse(readFileSync(dataPath, 'utf8')) as Test[]

const updatedData = testsData.map((test) => ({
  id: uuidv4(), // Generate a unique ID
  data: test.data, // Retain the existing 'data' field
  category: test.category, // Retain the existing 'category' field
}))

// Write the updated data back to a new JSON file
writeFileSync('testsWithIds.json', JSON.stringify(updatedData, null, 2))
console.log('IDs added successfully, and structure updated!')
