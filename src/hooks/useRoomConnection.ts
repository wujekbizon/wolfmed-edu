import { useEffect, useRef, useState, useCallback } from 'react'
import { RoomConnection } from '@teaching-playground/core/dist/services/RoomConnection'
import type { User } from '@teaching-playground/core'
import { toast } from 'react-hot-toast'

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
  username: string
  role: "teacher" | "student" | "admin"
  displayName?: string
  status?: string
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

  // v1.4.3 FIX: Track if this is a React Strict Mode remount
  // React 18 Strict Mode causes mount -> unmount -> remount in dev
  // We need to prevent disconnecting during this cycle
  const strictModeRemountTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isStrictModeRemountRef = useRef(false)

  // v1.4.0 Recording state
  const [isRecording, setIsRecording] = useState(false)
  const [recordingDuration, setRecordingDuration] = useState(0)
  const recordingBlobRef = useRef<Blob | null>(null)
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Store user in ref to avoid dependency issues
  const userRef = useRef(user);
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  useEffect(() => {
    mountedRef.current = true;
    isConnectingRef.current = false;
    hasJoinedRoomRef.current = false;

    // v1.4.3 FIX: Check if this is a Strict Mode remount
    // If we detect a remount within 100ms, it's Strict Mode
    if (isStrictModeRemountRef.current) {
      isStrictModeRemountRef.current = false
      if (strictModeRemountTimeoutRef.current) {
        clearTimeout(strictModeRemountTimeoutRef.current)
        strictModeRemountTimeoutRef.current = null
      }
      // Don't setup new connection if we're remounting
      if (connectionRef.current) {
        return
      }
    }

    const setupConnection = async () => {
      if (!mountedRef.current || isConnectingRef.current) return;

      try {
        isConnectingRef.current = true;

        const connection = new RoomConnection(roomId, userRef.current, serverUrl);
        connectionRef.current = connection;

        connection.on('connected', async () => {
          if (!mountedRef.current) return;
          setState(prev => ({ ...prev, isConnected: true }));
        });

        connection.on('disconnected', async () => {
          if (!mountedRef.current) return;

          setState(prev => ({
            ...prev,
            isConnected: false,
            systemMessage: 'Disconnected from server. Attempting to reconnect...'
          }));

          // If we're unmounting, this is handled in the cleanup function
          // If this is an unexpected disconnection, we still want to be in the room
        });

        // Listen for the 'welcome' event
        connection.on('welcome', (data: { message: string, timestamp: string }) => {
          setState(prev => ({
            ...prev,
            systemMessage: data.message
          }));
        });

        // Handle join room errors (v1.4.4 Bug Fix)
        connection.on('join_room_error', ({ error, roomId: errorRoomId }: { error: string, roomId?: string }) => {
          if (!mountedRef.current) return;
          console.error('Failed to join room:', error);

          setState(prev => ({
            ...prev,
            systemMessage: `Failed to join room: ${error}`,
            isConnected: false
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
          setRemoteStreams(prev => new Map(prev).set(peerId, stream));
        });

        connection.on('stream_removed', (peerId: string) => {
          if (!mountedRef.current) return;
          setRemoteStreams(prev => {
            const next = new Map(prev);
            next.delete(peerId);
            return next;
          });
        });

        connection.on('user_joined', ({ userId, socketId, username, role, displayName, status }: UserEvent) => {
          if (!mountedRef.current) return;

          // v1.4.4 FIX: Add participant to state when they join
          setState(prev => {
            // Check if participant already exists (prevent duplicates)
            const exists = prev.participants.some(p => p.socketId === socketId || p.id === userId)
            if (exists) {
              return prev
            }

            const newParticipant = {
              id: userId,
              username,
              role,
              displayName: displayName || username,
              status: status || 'online',
              socketId,
              joinedAt: new Date().toISOString(),
              canStream: true,  // v1.4.4: All participants can stream (WebRTC P2P)
              canChat: true,
              canScreenShare: role === 'teacher' || role === 'admin',
              handRaised: false
            }

            return {
              ...prev,
              participants: [...prev.participants, newParticipant]
            }
          })
        });

        connection.on('user_left', ({ socketId }: { socketId: string }) => {
          if (!mountedRef.current) return;

          // v1.4.4 FIX: Remove participant from state when they leave
          setState(prev => ({
            ...prev,
            participants: prev.participants.filter(p => p.socketId !== socketId)
          }))
        });

        connection.on('stream_status_change', ({ isStreaming, userId, username }) => {
          if (!mountedRef.current) return;
          // Streaming status is managed by the WebSocket server
        });

        connection.on('room_cleared', ({ roomId: clearedRoomId }: { roomId: string }) => {
          if (!mountedRef.current) return;

          setState(prev => ({
            ...prev,
            systemMessage: 'This lecture has ended. The room has been cleared.',
            participants: [],
            messages: []
          }));

          setTimeout(() => {
            if (connectionRef.current && mountedRef.current) {
              connectionRef.current.disconnect();
            }
          }, 2000);
        });

        // Handle automatic room closure (v1.1.0)
        connection.on('room_closed', ({ roomId: closedRoomId, reason }: { roomId: string, reason: string }) => {
          if (!mountedRef.current) return;

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

          setState(prev => ({
            ...prev,
            systemMessage: `Server maintenance. Will reconnect automatically.`,
            isConnected: false
          }));

          // Auto-reconnect after 5 seconds
          setTimeout(() => {
            if (mountedRef.current && connectionRef.current) {
              connectionRef.current.connect();
            }
          }, 5000);
        });

        // Participant Controls (v1.3.1)
        // Hand raise events
        connection.on('hand_raised', ({ userId, username, timestamp }: { userId: string, username: string, timestamp: string }) => {
          if (!mountedRef.current) return;

          setState(prev => ({
            ...prev,
            participants: prev.participants.map(p =>
              p.id === userId
                ? { ...p, handRaised: true, handRaisedAt: timestamp }
                : p
            )
          }));
        });

        connection.on('hand_lowered', ({ userId, timestamp }: { userId: string, timestamp: string }) => {
          if (!mountedRef.current) return;

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

          setState(prev => ({
            ...prev,
            participants: prev.participants.filter(p => p.id !== userId)
          }));
        });

        // Client-side event handling (v1.3.1)
        // Mute all participants
        connection.on('mute_all', ({ requestedBy, timestamp }: { requestedBy: string, timestamp: string }) => {
          if (!mountedRef.current) return;

          setState(prev => ({
            ...prev,
            systemMessage: 'Teacher has muted all participants'
          }));
        });

        // Individual participant muted by teacher
        connection.on('muted_by_teacher', ({ requestedBy, reason, timestamp }: { requestedBy: string, reason?: string, timestamp: string }) => {
          if (!mountedRef.current) return;
          console.log(`You were muted by ${requestedBy} at ${timestamp}${reason ? `: ${reason}` : ''}`);

          setState(prev => ({
            ...prev,
            systemMessage: `You have been muted by the teacher${reason ? `: ${reason}` : ''}`
          }));
        });

        // Kicked from room
        connection.on('kicked_from_room', ({ roomId, reason, kickedBy, timestamp }: { roomId: string, reason: string, kickedBy: string, timestamp: string }) => {
          if (!mountedRef.current) return;
          console.log(`You were kicked from room ${roomId} by ${kickedBy} at ${timestamp}: ${reason}`);

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

        // Recording Events (v1.4.0)
        connection.on('recording_started', ({ timestamp }: { timestamp: string }) => {
          if (!mountedRef.current) return;
          console.log(`[v1.4.0] Recording started at ${timestamp}`);
          setIsRecording(true);
          setRecordingDuration(0);

          // Start duration counter
          recordingIntervalRef.current = setInterval(() => {
            setRecordingDuration(prev => prev + 1);
          }, 1000);
        });

        connection.on('recording_stopped', ({ blob, duration, size, mimeType, timestamp }: { blob: Blob, duration: number, size: number, mimeType: string, timestamp: string }) => {
          if (!mountedRef.current) return;
          console.log(`[v1.4.0] Recording stopped at ${timestamp}, duration: ${duration}s, size: ${size} bytes`);
          setIsRecording(false);
          recordingBlobRef.current = blob;

          // Clear duration counter
          if (recordingIntervalRef.current) {
            clearInterval(recordingIntervalRef.current);
            recordingIntervalRef.current = null;
          }

          // Auto-download the recording
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `lecture-${roomId}-${Date.now()}.webm`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          console.log(`[v1.4.0] Recording downloaded as lecture-${roomId}-${Date.now()}.webm`);
        });

        await connection.connect();
        isConnectingRef.current = false;
        return connection;
      } catch (error) {
        console.error('Failed to setup connection:', error);
        isConnectingRef.current = false;

        // Show user-friendly error message
        setState(prev => ({
          ...prev,
          isConnected: false,
          systemMessage: 'Unable to connect to server. Please check your internet connection or try again later.'
        }));

        return null;
      }
    };

    setupConnection();

    return () => {
      // v1.4.3 FIX: Mark as potential Strict Mode remount
      // If component remounts within 100ms, we'll know it was Strict Mode
      isStrictModeRemountRef.current = true
      strictModeRemountTimeoutRef.current = setTimeout(() => {
        isStrictModeRemountRef.current = false
      }, 100)

      mountedRef.current = false

      // v1.4.3 FIX: In development, Strict Mode causes immediate remount
      // Don't disconnect if we detect this pattern
      if (process.env.NODE_ENV === 'development' && isStrictModeRemountRef.current) {
        return
      }

      // 1. Clean up local stream
      if (localStream) {
        localStream.getTracks().forEach(track => {
          track.stop()
        })
        setLocalStream(null)
      }

      // 3. Clean up remote streams
      setRemoteStreams(new Map())

      // 4. Disconnect WebSocket/WebRTC
      if (connectionRef.current) {
        connectionRef.current.disconnect()
        connectionRef.current = null
      }

      // 5. Reset state
      isConnectingRef.current = false
      hasJoinedRoomRef.current = false

      // Cancel any pending operations
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
        reconnectTimeoutRef.current = null
      }

      // v1.4.0: Clear recording interval
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current)
        recordingIntervalRef.current = null
      }

      // Clear remote streams
      setRemoteStreams(new Map())
    };
  }, [roomId, serverUrl, localStream]); // Added localStream to deps

  const startStream = async (quality?: 'low' | 'medium' | 'high') => {
    try {
      if (!connectionRef.current) {
        console.error('No connection available');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      setLocalStream(stream);
      await connectionRef.current.startStream(stream, quality);
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

    if (localStream) {
      localStream.getTracks().forEach(track => {
        track.stop();
      });
      setLocalStream(null);
    }

    connectionRef.current.stopStream();
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
  // v1.4.4: Use RoomConnection methods instead of raw emit
  const raiseHand = useCallback(() => {
    if (connectionRef.current) {
      try {
        connectionRef.current.raiseHand();
      } catch (error) {
        console.error('[v1.4.4] Failed to raise hand:', error);
      }
    }
  }, []);

  const lowerHand = useCallback(() => {
    if (connectionRef.current) {
      try {
        connectionRef.current.lowerHand();
      } catch (error) {
        console.error('[v1.4.4] Failed to lower hand:', error);
      }
    }
  }, []);

  const muteAllParticipants = useCallback(() => {
    if (connectionRef.current) {
      if (userRef.current.role !== 'teacher' && userRef.current.role !== 'admin') {
        console.error('[v1.4.4] Only teachers/admins can mute all participants');
        return;
      }

      try {
        connectionRef.current.muteAllParticipants();
      } catch (error) {
        console.error('[v1.4.4] Failed to mute all participants:', error);
      }
    }
  }, []);

  const muteParticipant = useCallback((targetUserId: string) => {
    if (connectionRef.current) {
      if (userRef.current.role !== 'teacher' && userRef.current.role !== 'admin') {
        console.error('[v1.4.4] Only teachers/admins can mute participants');
        return;
      }

      try {
        connectionRef.current.muteParticipant(targetUserId);
      } catch (error) {
        console.error('[v1.4.4] Failed to mute participant:', error);
      }
    }
  }, []);

  const kickParticipant = useCallback((targetUserId: string, reason?: string) => {
    if (connectionRef.current) {
      if (userRef.current.role !== 'teacher' && userRef.current.role !== 'admin') {
        console.error('[v1.4.4] Only teachers/admins can kick participants');
        return;
      }

      try {
        connectionRef.current.kickParticipant(targetUserId, reason || 'Removed from room');
      } catch (error) {
        console.error('[v1.4.4] Failed to kick participant:', error);
      }
    }
  }, []);

  // Recording Controls (v1.4.0)
  const startRecording = useCallback(async () => {
    if (!connectionRef.current) {
      console.error('[v1.4.0] No connection available for recording');
      return;
    }

    if (userRef.current.role !== 'teacher' && userRef.current.role !== 'admin') {
      console.error('[v1.4.0] Only teachers/admins can record lectures');
      return;
    }

    try {
      // v1.4.7 FIX: Automatically start stream if not active
      let streamToRecord = localStream;

      if (!streamToRecord) {
        console.log('[v1.4.0] No local stream available, starting stream first...');
        toast.loading('Starting camera and microphone...', { id: 'recording-start' });

        // Start the stream with default quality
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });

        setLocalStream(stream);
        await connectionRef.current.startStream(stream, 'medium');
        streamToRecord = stream;

        toast.success('Camera started, now recording...', { id: 'recording-start' });
      }

      // Now start recording with the stream
      await connectionRef.current.startRecording(streamToRecord, {
        videoBitsPerSecond: 2500000 // 2.5 Mbps
      });
    } catch (error) {
      console.error('[v1.4.0] Failed to start recording:', error);
      toast.error('Failed to start recording. Please check camera permissions.', { id: 'recording-start' });
      throw error;
    }
  }, [localStream]);

  const stopRecording = useCallback(() => {
    if (!connectionRef.current) {
      console.error('[v1.4.0] No connection available');
      return;
    }

    try {
      connectionRef.current.stopRecording();
    } catch (error) {
      console.error('[v1.4.0] Failed to stop recording:', error);
      throw error;
    }
  }, []);

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
    kickParticipant,
    // Recording Controls (v1.4.0)
    startRecording,
    stopRecording,
    isRecording,
    recordingDuration
  };
} 