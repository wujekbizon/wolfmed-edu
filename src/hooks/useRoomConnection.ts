import { useEffect, useRef, useState, useCallback } from 'react'
import { RoomConnection } from '@teaching-playground/core/dist/services/RoomConnection'
import type { User } from '@teaching-playground/core'

interface UseRoomConnectionOptions {
  roomId: string
  user: User
  serverUrl: string
}

interface RoomMessage {
  messageId: string
  sequence: number
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
  participants: Array<{
    id: string
    username: string
    role: "teacher" | "student" | "admin"
    displayName?: string
    email?: string
    status: string
    socketId: string
    joinedAt: string
    canStream: boolean
    canChat: boolean
    canScreenShare: boolean
    isStreaming?: boolean
    handRaised?: boolean
    handRaisedAt?: string
  }>
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
    handRaised?: boolean
    handRaisedAt?: string
  }>
  systemMessage?: string;
}

export function useRoomConnection({ roomId, user, serverUrl }: UseRoomConnectionOptions) {
  const connectionRef = useRef<RoomConnection | null>(null)
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

        const handleRoomState = (stateUpdate: RoomStateUpdate) => {
          setState(prev => ({
            ...prev,
            stream: stateUpdate.stream,
            participants: stateUpdate.participants || []
          }));

          // Request message history after room_state
          if (connectionRef.current) {
            connectionRef.current.emit('request_message_history', roomId)
          }
        };

        connection.on('room_state', handleRoomState);

        // Handle message history (v1.1.0)
        connection.on('message_history', (data: { messages?: RoomMessage[] }) => {
          if (!mountedRef.current) return;
          const messages = data?.messages || [];
          console.log('Received message history:', messages.length, 'messages');
          setState(prev => ({
            ...prev,
            messages
          }));
        });

        connection.on('message_received', (message: RoomMessage) => {
          if (!mountedRef.current) return;
          setState(prev => {
            // Use messageId for deduplication (v1.1.0)
            const isDuplicate = prev.messages.some(m => m.messageId === message.messageId);
            if (isDuplicate) return prev;

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

        connection.on('user_joined', ({ userId, socketId }: UserEvent) => {
          if (!mountedRef.current) return;
          console.log('User joined:', userId, socketId);
          // Participants are updated via room_state event
        });

        connection.on('user_left', ({ socketId }: { socketId: string }) => {
          if (!mountedRef.current) return;
          console.log('User left:', socketId);
          // Participants are updated via room_state event
        });

        connection.on('stream_status_change', ({ isStreaming, userId, username }) => {
          if (!mountedRef.current) return;
          console.log(`Stream status changed for ${username} (${userId}): ${isStreaming ? 'streaming' : 'not streaming'}`);
          // Streaming status is managed by the WebSocket server
        });

        connection.on('room_cleared', ({ roomId: clearedRoomId }: { roomId: string }) => {
          if (!mountedRef.current) return;
          console.log(`Room ${clearedRoomId} has been cleared (lecture ended)`);

          setState(prev => ({
            ...prev,
            systemMessage: 'This lecture has ended. The room has been cleared.',
            participants: [],
            messages: []
          }));

          setTimeout(() => {
            if (connectionRef.current && mountedRef.current) {
              console.log('Disconnecting due to room cleared event');
              connectionRef.current.disconnect();
            }
          }, 2000);
        });

        // Handle automatic room closure (v1.1.0)
        connection.on('room_closed', ({ roomId: closedRoomId, reason }: { roomId: string, reason: string }) => {
          if (!mountedRef.current) return;
          console.log(`Room ${closedRoomId} was closed: ${reason}`);

          setState(prev => ({
            ...prev,
            systemMessage: `Room closed: ${reason}`,
            isConnected: false,
            participants: [],
            messages: []
          }));

          setTimeout(() => {
            if (connectionRef.current && mountedRef.current) {
              connectionRef.current.disconnect();
            }
          }, 3000);
        });

        // Handle server shutdown (v1.1.0)
        connection.on('server_shutdown', ({ message }: { message: string }) => {
          if (!mountedRef.current) return;
          console.log('Server shutdown:', message);

          setState(prev => ({
            ...prev,
            systemMessage: `Server maintenance. Will reconnect automatically.`,
            isConnected: false
          }));

          // Auto-reconnect after 5 seconds
          setTimeout(() => {
            if (mountedRef.current && connectionRef.current) {
              console.log('Attempting reconnect after server shutdown...');
              connectionRef.current.connect();
            }
          }, 5000);
        });

        // Participant Controls (v1.3.1)
        // Hand raise events
        connection.on('hand_raised', ({ userId, username, timestamp }: { userId: string, username: string, timestamp: string }) => {
          if (!mountedRef.current) return;
          console.log(`${username} raised their hand`);

          setState(prev => ({
            ...prev,
            participants: prev.participants.map(p =>
              p.id === userId
                ? { ...p, handRaised: true, handRaisedAt: timestamp }
                : p
            )
          }));
        });

        connection.on('hand_lowered', ({ userId }: { userId: string }) => {
          if (!mountedRef.current) return;
          console.log(`Hand lowered by ${userId}`);

          setState(prev => ({
            ...prev,
            participants: prev.participants.map(p => {
              if (p.id === userId) {
                const { handRaised, handRaisedAt, ...rest } = p;
                return { ...rest, handRaised: false } as typeof p;
              }
              return p;
            })
          }));
        });

        // Participant kicked
        connection.on('participant_kicked', ({ userId, reason }: { userId: string, reason: string }) => {
          if (!mountedRef.current) return;
          console.log(`${userId} was removed: ${reason}`);

          setState(prev => ({
            ...prev,
            participants: prev.participants.filter(p => p.id !== userId)
          }));
        });

        // Client-side event handling (v1.3.1)
        // Mute all participants
        connection.on('mute_all', () => {
          if (!mountedRef.current) return;
          console.log('Teacher muted all participants');

          setState(prev => ({
            ...prev,
            systemMessage: 'Teacher has muted all participants'
          }));
        });

        // Individual participant muted by teacher
        connection.on('muted_by_teacher', ({ teacherId, teacherName }: { teacherId: string, teacherName: string }) => {
          if (!mountedRef.current) return;
          console.log(`You were muted by ${teacherName}`);

          setState(prev => ({
            ...prev,
            systemMessage: `You have been muted by ${teacherName}`
          }));
        });

        // Kicked from room
        connection.on('kicked_from_room', ({ reason, kickedBy }: { reason: string, kickedBy: string }) => {
          if (!mountedRef.current) return;
          console.log(`You were kicked from the room: ${reason}`);

          setState(prev => ({
            ...prev,
            systemMessage: `You have been removed from the room: ${reason}`,
            isConnected: false
          }));

          // Disconnect after a brief delay to show the message
          setTimeout(() => {
            if (connectionRef.current && mountedRef.current) {
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

      // 1. Clean up local stream
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
  }, [roomId, serverUrl]); // Stable dependencies only

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
    if (connectionRef.current) {
      connectionRef.current.disconnect();
      connectionRef.current = null;
    }
  };

  // Participant Controls (v1.3.1)
  const raiseHand = useCallback(() => {
    if (connectionRef.current) {
      connectionRef.current.emit('raise_hand', {
        roomId,
        userId: userRef.current.id
      });
    }
  }, [roomId]);

  const lowerHand = useCallback(() => {
    if (connectionRef.current) {
      connectionRef.current.emit('lower_hand', {
        roomId,
        userId: userRef.current.id
      });
    }
  }, [roomId]);

  const muteAllParticipants = useCallback(() => {
    if (connectionRef.current) {
      if (userRef.current.role !== 'teacher' && userRef.current.role !== 'admin') {
        throw new Error('Only teachers can mute all participants');
      }

      connectionRef.current.emit('mute_all_participants', {
        roomId,
        requesterId: userRef.current.id
      });
    }
  }, [roomId]);

  const muteParticipant = useCallback((targetUserId: string) => {
    if (connectionRef.current) {
      if (userRef.current.role !== 'teacher' && userRef.current.role !== 'admin') {
        throw new Error('Only teachers can mute participants');
      }

      connectionRef.current.emit('mute_participant', {
        roomId,
        targetUserId,
        requesterId: userRef.current.id
      });
    }
  }, [roomId]);

  const kickParticipant = useCallback((targetUserId: string, reason?: string) => {
    if (connectionRef.current) {
      if (userRef.current.role !== 'teacher' && userRef.current.role !== 'admin') {
        throw new Error('Only teachers can kick participants');
      }

      connectionRef.current.emit('kick_participant', {
        roomId,
        targetUserId,
        requesterId: userRef.current.id,
        reason
      });
    }
  }, [roomId]);

  return {
    state,
    localStream,
    remoteStreams,
    sendMessage,
    startStream,
    stopStream,
    exitRoom,
    connection: connectionRef.current, // Expose for event listeners (v1.1.3+)
    // Participant Controls (v1.3.1)
    raiseHand,
    lowerHand,
    muteAllParticipants,
    muteParticipant,
    kickParticipant
  };
} 