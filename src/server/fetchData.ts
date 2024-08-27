import path from 'path'
import fs from 'fs'
import { ServerData } from '@/types/dataTypes'

export async function fetchData(file: string): Promise<ServerData> {
  const dataPath = path.join(process.cwd(), 'data', file)
  const fileContents = await fs.promises.readFile(dataPath, 'utf8')
  const data = JSON.parse(fileContents)
  return data
}
