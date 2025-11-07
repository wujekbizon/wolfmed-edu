import { useEffect, useRef, useState, useCallback } from 'react'
import { RoomConnection } from '@teaching-playground/core/dist/services/RoomConnection'
import type { User } from '@teaching-playground/core'
import { usePlaygroundStore } from '@/store/usePlaygroundStore'

interface UseRoomConnectionOptions {
  roomId: string
  user: User
  serverUrl: string
}

interface RoomMessage {
  userId: string
  username: string
  content: string
  timestamp: string
}

interface StreamState {
  isActive: boolean
  streamerId: string | null
  quality: 'low' | 'medium' | 'high'
}

interface RoomStateUpdate {
  stream: StreamState | null
  messages: RoomMessage[]
  participants: string[]
}

interface StreamAddedEvent {
  peerId: string
  stream: MediaStream
}

interface UserEvent {
  userId: string
  socketId: string
}

interface RoomState {
  isConnected: boolean
  messages: RoomMessage[]
  stream: StreamState | null
  participants: Array<{
    joinedAt: string
    id: string
    username: string
    role: "teacher" | "student" | "admin"
    status: string
    canStream: boolean
    canChat: boolean
    canScreenShare: boolean
  }>
  systemMessage?: string;
}

export function useRoomConnection({ roomId, user, serverUrl }: UseRoomConnectionOptions) {
  const connectionRef = useRef<RoomConnection | null>(null)
  const playground = usePlaygroundStore((state) => state.playground)
  const [state, setState] = useState<RoomState>({
    isConnected: false,
    messages: [],
    stream: null,
    participants: []
  })
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map())
  const mountedRef = useRef(true)
  const isConnectingRef = useRef(false)
  const hasJoinedRoomRef = useRef(false)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Store user in ref to avoid dependency issues
  const userRef = useRef(user);
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  // Handle joining the room
  const joinRoom = useCallback(async () => {
    if (!playground || hasJoinedRoomRef.current || !mountedRef.current) return;

    try {
      const currentUser = userRef.current;
      console.log(`Joining room ${roomId} as ${currentUser.username} (${currentUser.id})`);
      await playground.roomSystem.addParticipant(roomId, currentUser);
      hasJoinedRoomRef.current = true;
      console.log(`Successfully joined room ${roomId}`);
    } catch (error) {
      console.error(`Failed to join room ${roomId}:`, error);
    }
  }, [playground, roomId]);

  // Handle leaving the room
  const leaveRoom = useCallback(async () => {
    if (!playground || !hasJoinedRoomRef.current) return;

    try {
      const currentUser = userRef.current;
      console.log(`Leaving room ${roomId} as ${currentUser.username} (${currentUser.id})`);
      await playground.roomSystem.removeParticipant(roomId, currentUser.id);
      hasJoinedRoomRef.current = false;
      console.log(`Successfully left room ${roomId}`);
    } catch (error) {
      console.error(`Failed to leave room ${roomId}:`, error);
    }
  }, [playground, roomId]);

  useEffect(() => {
    mountedRef.current = true;
    isConnectingRef.current = false;
    hasJoinedRoomRef.current = false;

    const setupConnection = async () => {
      if (!mountedRef.current || isConnectingRef.current) return;

      try {
        isConnectingRef.current = true;
        console.log('Connecting to WebSocket server:', serverUrl);

        const connection = new RoomConnection(roomId, userRef.current, serverUrl);
        connectionRef.current = connection;

        connection.on('connected', async () => {
          console.log('Connected to room:', roomId);
          if (!mountedRef.current) return;
          
          setState(prev => ({ ...prev, isConnected: true }));
          
          // Join the room when connected
          await joinRoom();
        });

        connection.on('disconnected', async () => {
          console.log('Disconnected from room:', roomId);
          if (!mountedRef.current) return;
          
          setState(prev => ({ ...prev, isConnected: false }));
          
          // If we're unmounting, this is handled in the cleanup function
          // If this is an unexpected disconnection, we still want to be in the room
        });

        // Listen for the 'welcome' event
        connection.on('welcome', (data: { message: string, timestamp: string }) => {
          console.log('Server welcome:', data.message);
          setState(prev => ({
            ...prev,
            systemMessage: data.message
          }));
        });

        const handleRoomState = (stateUpdate: { // Changed parameter name to avoid conflict with outer 'state'
          stream: StreamState | null,
          messages: RoomMessage[],
          participants: Array<{
            joinedAt: string
            id: string
            username: string
            role: "teacher" | "student" | "admin"
            status: string
            canStream: boolean
            canChat: boolean
            canScreenShare: boolean
          }>
        }) => {
          setState(prev => ({
            ...prev,
            stream: stateUpdate.stream,
            participants: stateUpdate.participants || [], 
            messages: stateUpdate.messages || []
          }));
        };

        connection.on('room_state', handleRoomState);

        connection.on('message_received', (message: RoomMessage) => {
          if (!mountedRef.current) return;
          setState(prev => {
            // Check if message already exists (prevent duplicates)
            const isDuplicate = prev.messages.some(
              m => m.userId === message.userId &&
                   m.content === message.content &&
                   m.timestamp === message.timestamp
            );

            if (isDuplicate) {
              console.log('Duplicate message detected, skipping');
              return prev;
            }

            return {
              ...prev,
              messages: [...prev.messages, message]
            };
          });
        });

        connection.on('stream_started', (streamState: StreamState) => {
          if (!mountedRef.current) return;
          setState(prev => ({ ...prev, stream: streamState }));
        });

        connection.on('stream_stopped', () => {
          if (!mountedRef.current) return;
          setState(prev => ({ ...prev, stream: null }));
          setLocalStream(null);
        });

        connection.on('stream_added', ({ peerId, stream }: StreamAddedEvent) => {
          if (!mountedRef.current) return;
          console.log('Stream added from peer:', peerId);
          setRemoteStreams(prev => new Map(prev).set(peerId, stream));
        });

        connection.on('stream_removed', (peerId: string) => {
          if (!mountedRef.current) return;
          console.log('Stream removed from peer:', peerId);
          setRemoteStreams(prev => {
            const next = new Map(prev);
            next.delete(peerId);
            return next;
          });
        });

        connection.on('user_joined', async ({ userId, socketId }: UserEvent) => {
          if (!mountedRef.current) return;
          if (playground) {
            try {
              // Fetch updated participants after user joins
              const participants = await playground.roomSystem.getRoomParticipants(roomId);
              setState(prev => ({
                ...prev,
                participants: participants
              }));
            } catch (error) {
              console.error('Failed to update participants after user joined:', error);
            }
          }
        });

        connection.on('user_left', async ({ socketId }: { socketId: string }) => {
          if (!mountedRef.current) return;
          if (playground) {
            try {
              // Fetch updated participants after user leaves
              const participants = await playground.roomSystem.getRoomParticipants(roomId);
              setState(prev => ({
                ...prev,
                participants: participants
              }));
            } catch (error) {
              console.error('Failed to update participants after user left:', error);
            }
          }
        });

        connection.on('stream_status_change', async ({ isStreaming, userId, username }) => {
          if (!mountedRef.current) return;
          console.log(`Stream status changed for ${username} (${userId}): ${isStreaming ? 'streaming' : 'not streaming'}`);

          if (playground) {
            try {
              await playground.roomSystem.updateParticipantStreamingStatus(roomId, userId, isStreaming);
              console.log(`Updated streaming status in database for ${username} in room ${roomId}`);
            } catch (error) {
              console.error('Failed to update streaming status in database:', error);
            }
          }
        });

        connection.on('room_cleared', ({ roomId: clearedRoomId }: { roomId: string }) => {
          if (!mountedRef.current) return;
          console.log(`Room ${clearedRoomId} has been cleared (lecture ended)`);

          // Update state to show system message
          setState(prev => ({
            ...prev,
            systemMessage: 'This lecture has ended. The room has been cleared.',
            participants: [],
            messages: []
          }));

          // Disconnect after a short delay to allow user to see the message
          setTimeout(() => {
            if (connectionRef.current && mountedRef.current) {
              console.log('Disconnecting due to room cleared event');
              connectionRef.current.disconnect();
            }
          }, 2000);
        });

        await connection.connect();
        return connection;
      } catch (error) {
        console.error('Failed to setup connection:', error);
        isConnectingRef.current = false;
        return null;
      }
    };

    setupConnection();

    return () => {
      console.log('Starting connection cleanup...')
      mountedRef.current = false
      
      // 1. Leave the room
      leaveRoom().then(() => {
        console.log('Successfully left room:', roomId)
      }).catch(err => {
        console.error('Error leaving room:', err)
      })

      // 2. Clean up local stream
      if (localStream) {
        console.log('Stopping local stream tracks')
        localStream.getTracks().forEach(track => {
          track.stop()
          console.log(`Stopped ${track.kind} track`)
        })
        setLocalStream(null)
      }

      // 3. Clean up remote streams
      console.log('Clearing remote streams')
      setRemoteStreams(new Map())

      // 4. Disconnect WebSocket/WebRTC
      if (connectionRef.current) {
        console.log('Disconnecting RoomConnection')
        connectionRef.current.disconnect()
        connectionRef.current = null
      }

      // 5. Reset state
      isConnectingRef.current = false
      hasJoinedRoomRef.current = false
      console.log('Cleanup complete')

      // Add this to the cleanup:
      const cleanup = () => {
        console.log('[Cleanup] Starting...')

        // Cancel any pending operations
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current)
        }

        // Force disconnect
        if (connectionRef.current) {
          console.log('[Cleanup] Force-disconnecting')
          connectionRef.current.disconnect()
        }

        // Clear remote streams
        setRemoteStreams(new Map())
        console.log('[Cleanup] Completed')
      }
      cleanup()
    };
  }, [roomId, serverUrl, playground, leaveRoom, joinRoom]); // Stable dependencies only

  const startStream = async (quality?: 'low' | 'medium' | 'high') => {
    try {
      if (!connectionRef.current) {
        console.error('No connection available');
        return;
      }

      console.log('Requesting media stream...');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      console.log('Media stream obtained:', stream.id);

      setLocalStream(stream);
      await connectionRef.current.startStream(stream, quality);
      
      // The streaming status will be updated via the stream_status_change event
      console.log('Stream started with quality:', quality);
    } catch (error) {
      console.error('Failed to start stream:', error);
      throw error;
    }
  };

  const stopStream = () => {
    if (!connectionRef.current) {
      console.error('No connection available');
      return;
    }

    console.log('Stopping stream');
    
    if (localStream) {
      localStream.getTracks().forEach(track => {
        track.stop();
        console.log('Stopped track:', track.kind);
      });
      setLocalStream(null);
    }
    
    connectionRef.current.stopStream();
    // The streaming status will be updated via the stream_status_change event
    console.log('Stream stopped');
  };

  const sendMessage = (content: string) => {
    if (!connectionRef.current) {
      console.error('No connection available');
      return;
    }
    connectionRef.current.sendMessage(content);
  };
  
  // Expose method to manually leave the room
  const exitRoom = async () => {
    await leaveRoom();
    if (connectionRef.current) {
      connectionRef.current.disconnect();
      connectionRef.current = null;
    }
  };

  return {
    state,
    localStream,
    remoteStreams,
    sendMessage,
    startStream,
    stopStream,
    exitRoom
  };
} 