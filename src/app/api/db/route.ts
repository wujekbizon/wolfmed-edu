import { promises as fs } from 'fs'
import path from 'path'
import { NextResponse } from 'next/server'

const dbPath = path.join(process.cwd(), 'src/data/test-data.json')

export async function GET() {
  try {
    const content = await fs.readFile(dbPath, 'utf-8')
    return NextResponse.json(JSON.parse(content))
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read database' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    await fs.writeFile(dbPath, JSON.stringify(data, null, 2))
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to write to database' }, { status: 500 })
  }
}
