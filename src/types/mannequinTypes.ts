export type MannequinViewKey = 'front' | 'back' | 'left' | 'right'

export type MannequinView = {
  label: string
  direction: [number, number, number]
}

export type CameraPosition = [number, number, number]

export type MannequinZoneMap = {
  zones: string[]
  vertexZones: number[]
}
