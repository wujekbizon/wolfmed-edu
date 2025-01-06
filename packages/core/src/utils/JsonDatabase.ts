import { SystemError } from '../interfaces'

export class JsonDatabase {
  private data: any = null

  constructor(private filename: string = 'test-data.json') {}

  private async load() {
    try {
      const response = await fetch('/api/db')
      if (!response.ok) throw new Error('Failed to load database')
      this.data = await response.json()
    } catch (error) {
      if (!this.data) {
        this.data = { events: [], rooms: [], participants: [] }
        await this.save()
      }
      throw new SystemError('DATABASE_READ_ERROR', 'Failed to read database')
    }
  }

  private async save() {
    try {
      const response = await fetch('/api/db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.data),
      })
      if (!response.ok) throw new Error('Failed to save database')
    } catch (error) {
      throw new SystemError('DATABASE_WRITE_ERROR', 'Failed to write to database')
    }
  }

  async find(collection: string, query: Record<string, any> = {}) {
    await this.load()
    return this.data[collection].filter((item: any) =>
      Object.entries(query).every(([key, value]) => item[key] === value)
    )
  }

  async findOne(collection: string, query: Record<string, any>) {
    const results = await this.find(collection, query)
    return results[0] || null
  }

  async insert(collection: string, document: Record<string, any>) {
    await this.load()
    this.data[collection].push(document)
    await this.save()
    return document
  }

  async update(collection: string, query: Record<string, any>, update: Record<string, any>) {
    await this.load()
    const index = this.data[collection].findIndex((item: any) =>
      Object.entries(query).every(([key, value]) => item[key] === value)
    )
    if (index !== -1) {
      this.data[collection][index] = { ...this.data[collection][index], ...update }
      await this.save()
      return this.data[collection][index]
    }
    return null
  }

  async delete(collection: string, query: Record<string, any>) {
    await this.load()
    const initialLength = this.data[collection].length
    this.data[collection] = this.data[collection].filter(
      (item: any) => !Object.entries(query).every(([key, value]) => item[key] === value)
    )
    await this.save()
    return initialLength !== this.data[collection].length
  }
}
