import { JsonDatabase } from "../db/JsonDatabase";
import {
  Room,
  RoomConfig,
  RoomParticipant,
  SystemError,
  User,
} from "../interfaces";
import RealTimeCommunicationSystem from "./RealTimeCommunicationSystem";

export default class RoomManagementSystem {
  private db: JsonDatabase;
  private commsSystem: RealTimeCommunicationSystem;

  constructor(private config?: RoomConfig) {
    // Use singleton instance of JsonDatabase
    this.db = JsonDatabase.getInstance();
    this.commsSystem = new RealTimeCommunicationSystem();
  }

  public getCommsSystem(): RealTimeCommunicationSystem {
    return this.commsSystem;
  }

  async getRoom(roomId: string): Promise<Room> {
    try {
      const room = await this.db.findOne("rooms", { id: roomId });
      if (!room) {
        throw new SystemError("ROOM_NOT_FOUND", `Room ${roomId} not found`);
      }
      return room;
    } catch (error) {
      throw new SystemError("ROOM_FETCH_FAILED", "Failed to fetch room", error);
    }
  }

  async addParticipant(roomId: string, user: User): Promise<RoomParticipant> {
    try {
      console.log(
        `Adding participant ${user.username} (${user.id}) to room ${roomId}`
      );
      const room = await this.getRoom(roomId);

      // Check if user is already in the room
      const existingParticipant = room.participants.find(
        (p) => p.id === user.id
      );
      if (existingParticipant) {
        console.log(`User ${user.username} is already in room ${roomId}`);
        return existingParticipant;
      }

      if (room.participants.length >= room.capacity) {
        throw new SystemError("ROOM_FULL", "Room has reached maximum capacity");
      }

      const participant: RoomParticipant = {
        ...user,
        joinedAt: new Date().toISOString(),
        canStream: user.role === "teacher",
        canChat: true,
        canScreenShare: user.role === "teacher",
      };

      // Create a new array with all existing participants plus the new one
      const updatedParticipants = [...room.participants, participant];

      // Update the room in the database with the new participants array
      const updatedRoom = await this.db.update(
        "rooms",
        { id: roomId },
        {
          participants: updatedParticipants,
          updatedAt: new Date().toISOString(),
        }
      );

      if (!updatedRoom) {
        throw new SystemError(
          "PARTICIPANT_ADD_FAILED",
          "Failed to update room with new participant"
        );
      }

      this.commsSystem.emit("user_joined", participant);
      console.log(
        `Successfully added ${user.username} to room ${roomId}. Total participants: ${updatedParticipants.length}`
      );
      console.log(
        `Participants in room: ${updatedParticipants
          .map((p) => p.username)
          .join(", ")}`
      );
      return participant;
    } catch (error) {
      console.error(
        `Failed to add participant ${user.username} to room ${roomId}:`,
        error
      );
      throw new SystemError(
        "PARTICIPANT_ADD_FAILED",
        "Failed to add participant",
        error
      );
    }
  }

  async removeParticipant(roomId: string, userId: string): Promise<void> {
    try {
      console.log(`Removing participant ${userId} from room ${roomId}`);
      const room = await this.getRoom(roomId);

      // Filter out the participant
      const updatedParticipants = room.participants.filter(
        (p) => p.id !== userId
      );

      // Update the room in the database
      const updatedRoom = await this.db.update(
        "rooms",
        { id: roomId },
        {
          participants: updatedParticipants,
          updatedAt: new Date().toISOString(),
        }
      );

      if (!updatedRoom) {
        throw new SystemError(
          "PARTICIPANT_REMOVE_FAILED",
          "Failed to update room after removing participant"
        );
      }

      this.commsSystem.emit("user_left", { userId });
      console.log(
        `Successfully removed ${userId} from room ${roomId}. Remaining participants: ${updatedParticipants.length}`
      );
    } catch (error) {
      console.error(
        `Failed to remove participant ${userId} from room ${roomId}:`,
        error
      );
      throw new SystemError(
        "PARTICIPANT_REMOVE_FAILED",
        "Failed to remove participant",
        error
      );
    }
  }

  async getRoomParticipants(roomId: string): Promise<RoomParticipant[]> {
    try {
      const room = await this.getRoom(roomId);
      return room.participants;
    } catch (error) {
      console.error(
        `Failed to get participants for room ${roomId}:`,
        error
      );
      throw new SystemError(
        "PARTICIPANTS_FETCH_FAILED",
        "Failed to fetch room participants",
        error
      );
    }
  }

  async updateParticipantStreamingStatus(
    roomId: string,
    userId: string,
    isStreaming: boolean
  ): Promise<void> {
    try {
      console.log(
        `Updating streaming status for ${userId} in room ${roomId}: ${isStreaming}`
      );
      const room = await this.getRoom(roomId);

      // Find and update the participant
      const updatedParticipants = room.participants.map((p) =>
        p.id === userId ? { ...p, isStreaming } : p
      );

      // Update the room in the database
      const updatedRoom = await this.db.update(
        "rooms",
        { id: roomId },
        {
          participants: updatedParticipants,
          updatedAt: new Date().toISOString(),
        }
      );

      if (!updatedRoom) {
        throw new SystemError(
          "STREAMING_STATUS_UPDATE_FAILED",
          "Failed to update participant streaming status"
        );
      }

      console.log(
        `Successfully updated streaming status for ${userId} in room ${roomId}`
      );
    } catch (error) {
      console.error(
        `Failed to update streaming status for ${userId} in room ${roomId}:`,
        error
      );
      throw new SystemError(
        "STREAMING_STATUS_UPDATE_FAILED",
        "Failed to update streaming status",
        error
      );
    }
  }
}
