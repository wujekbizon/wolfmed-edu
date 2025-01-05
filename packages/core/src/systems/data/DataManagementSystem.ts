import { DataConfig } from '@/interfaces/data.interface'

export class DataManagementSystem {
  constructor(private config?: DataConfig) {}

  saveData(key: string, value: any) {
    console.log(`Saving data: ${key} = ${value}`)
  }

  fetchData(key: string) {
    console.log(`Fetching data for key: ${key}`)
    return null
  }
}
