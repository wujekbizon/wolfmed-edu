import path from 'path'
import fs from 'fs'

type Answer = {
  option: string
  isCorrect: boolean
}

interface TestData {
  question: string
  answers: Answer[]
}

export interface Test {
  data: TestData
  category: string
}

export async function getTests(): Promise<Test[]> {
  const dataPath = path.join(process.cwd(), 'data', 'tests.json')
  const fileContents = await fs.promises.readFile(dataPath, 'utf8')
  const data = JSON.parse(fileContents)
  return data
}
