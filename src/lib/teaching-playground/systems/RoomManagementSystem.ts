import { RoomConfig } from '../interfaces';
import  RealTimeCommunicationSystem  from './RealTimeCommunicationSystem';


export default class RoomManagementSystem {
  // private db: JsonDatabase
  private commsSystem: RealTimeCommunicationSystem

  constructor(private config?: RoomConfig) {
    this.commsSystem = new RealTimeCommunicationSystem()
  }

  public getCommsSystem(): RealTimeCommunicationSystem {
    return this.commsSystem;
  }

  
}
