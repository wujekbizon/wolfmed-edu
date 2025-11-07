import { TeachingPlaygroundConfig, User } from "../interfaces";
import {
  EventManagementSystem,
  RealTimeCommunicationSystem,
  RoomManagementSystem,
} from "../systems";

export default class TeachingPlayground {
  public roomSystem: RoomManagementSystem;
  private commsSystem: RealTimeCommunicationSystem;
  private eventSystem: EventManagementSystem;
  private currentUser: User | null = null;

  constructor(config: TeachingPlaygroundConfig) {
    this.roomSystem = new RoomManagementSystem(config.roomConfig);
    this.commsSystem = new RealTimeCommunicationSystem(config.commsConfig);
    this.eventSystem = new EventManagementSystem(config.eventConfig);

    // Wire up the event system with room system for cleanup operations
    this.eventSystem.setRoomSystem(this.roomSystem);
  }

  setCurrentUser(user: User | null): void {
    this.currentUser = user;
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }
}
