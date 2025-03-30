export interface Room {
  id: string
  name: string
  capacity: number
  features: {
    videoConference: boolean
    whiteboard: boolean
    screenSharing: boolean
  }
  status: 'available' | 'occupied' | 'maintenance'
  currentLecture?: string // lecture ID if room is occupied
  communicationStatus?: {
    websocket: boolean
    webrtc: boolean
    participants: number
  }
} 