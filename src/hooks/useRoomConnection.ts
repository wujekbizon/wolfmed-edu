import { useEffect, useRef, useState } from 'react'
import { RoomConnection, User } from '@teaching-playground/core'
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
    id: string
    username: string
    role: string
    status: string
    canStream: boolean
    canChat: boolean
    canScreenShare: boolean
  }>
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

  // Handle joining the room
  const joinRoom = async () => {
    if (!playground || hasJoinedRoomRef.current || !mountedRef.current) return;
    
    try {
      console.log(`Joining room ${roomId} as ${user.username} (${user.id})`);
      await playground.roomSystem.addParticipant(roomId, user);
      hasJoinedRoomRef.current = true;
      console.log(`Successfully joined room ${roomId}`);
    } catch (error) {
      console.error(`Failed to join room ${roomId}:`, error);
    }
  };
  
  // Handle leaving the room
  const leaveRoom = async () => {
    if (!playground || !hasJoinedRoomRef.current) return;
    
    try {
      console.log(`Leaving room ${roomId} as ${user.username} (${user.id})`);
      await playground.roomSystem.removeParticipant(roomId, user.id);
      hasJoinedRoomRef.current = false;
      console.log(`Successfully left room ${roomId}`);
    } catch (error) {
      console.error(`Failed to leave room ${roomId}:`, error);
    }
  };

  useEffect(() => {
    mountedRef.current = true;
    isConnectingRef.current = false;
    hasJoinedRoomRef.current = false;

    const setupConnection = async () => {
      if (!mountedRef.current || isConnectingRef.current) return;
      
      try {
        isConnectingRef.current = true;
        console.log('Connecting to WebSocket server:', serverUrl);
        
        const connection = new RoomConnection(roomId, user, serverUrl);
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

        connection.on('room_state_updated', async (roomState: RoomStateUpdate) => {
          if (!mountedRef.current) return;
          if (playground) {
            try {
              const participants = await playground.roomSystem.getRoomParticipants(roomId);
              setState(prev => ({
                ...prev,
                messages: roomState.messages,
                stream: roomState.stream,
                participants: participants.map(p => ({
                  ...p,
                  canStream: p.role === 'teacher',
                  canChat: true,
                  canScreenShare: p.role === 'teacher'
                }))
              }));
            } catch (error) {
              console.error('Failed to get room participants:', error);
            }
          }
        });

        connection.on('message_received', (message: RoomMessage) => {
          if (!mountedRef.current) return;
          setState(prev => ({
            ...prev,
            messages: [...prev.messages, message]
          }));
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
              const participants = await playground.roomSystem.getRoomParticipants(roomId);
              setState(prev => ({
                ...prev,
                participants: participants.map(p => ({
                  ...p,
                  canStream: p.role === 'teacher',
                  canChat: true,
                  canScreenShare: p.role === 'teacher'
                }))
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
              const participants = await playground.roomSystem.getRoomParticipants(roomId);
              setState(prev => ({
                ...prev,
                participants: participants.map(p => ({
                  ...p,
                  canStream: p.role === 'teacher',
                  canChat: true,
                  canScreenShare: p.role === 'teacher'
                }))
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
      console.log('Cleaning up room connection');
      mountedRef.current = false;
      
      // Explicit room leave on component unmount
      leaveRoom();
      
      if (localStream) {
        localStream.getTracks().forEach(track => {
          track.stop();
          console.log('Stopped track:', track.kind);
        });
        setLocalStream(null);
      }

      if (connectionRef.current) {
        connectionRef.current.disconnect();
        connectionRef.current = null;
      }

      isConnectingRef.current = false;
      hasJoinedRoomRef.current = false;
    };
  }, [roomId, user, serverUrl, playground]);

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

    console.log('Stopping stream...');
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