import { NextResponse } from 'next/server'
import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

export async function GET() {
  try {
    // Read the test data file
    const dataPath = join(process.cwd(), 'data', 'test-data.json')
    const fileContents = readFileSync(dataPath, 'utf8')
    const data = JSON.parse(fileContents)
    
    return NextResponse.json(data.rooms)
  } catch (error) {
    console.error('Error fetching rooms:', error)
    return NextResponse.json({ error: 'Failed to fetch rooms' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const dataPath = join(process.cwd(), 'data', 'test-data.json')
    const fileContents = readFileSync(dataPath, 'utf8')
    const data = JSON.parse(fileContents)
    
    // Update rooms data
    data.rooms = body
    
    // Write the updated data back to the file
    writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8')
    console.log('Successfully wrote updated room data to file')
    
    return NextResponse.json(data.rooms)
  } catch (error) {
    console.error('Error updating rooms:', error)
    return NextResponse.json({ error: 'Failed to update rooms' }, { status: 500 })
  }
} 