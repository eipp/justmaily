'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback
} from 'react'
import { MatrixClient, SimpleFsStorageProvider } from 'matrix-bot-sdk'

interface MatrixContextType {
  client: MatrixClient | null
  isConnected: boolean
  error: Error | null
  sendMessage: (roomId: string, content: any) => Promise<void>
  joinRoom: (roomId: string) => Promise<void>
  createRoom: (options: {
    name: string
    topic?: string
    isPublic?: boolean
  }) => Promise<string>
}

const MatrixContext = createContext<MatrixContextType | null>(null)

export function MatrixProvider({ children }: { children: React.ReactNode }) {
  const [client, setClient] = useState<MatrixClient | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    initializeClient()
    return () => {
      if (client) {
        client.stop()
      }
    }
  }, [])

  const initializeClient = async () => {
    try {
      const homeserverUrl = process.env.NEXT_PUBLIC_MATRIX_HOMESERVER_URL!
      const accessToken = process.env.NEXT_PUBLIC_MATRIX_ACCESS_TOKEN!

      const storage = new SimpleFsStorageProvider('matrix-store.json')
      const newClient = new MatrixClient(homeserverUrl, accessToken, storage)

      // Set up event handlers
      newClient.on('room.message', handleRoomMessage)
      newClient.on('room.join', handleRoomJoin)
      newClient.on('room.leave', handleRoomLeave)

      // Start the client
      await newClient.start()
      setClient(newClient)
      setIsConnected(true)
    } catch (err) {
      setError(err)
      console.error('Failed to initialize Matrix client:', err)
    }
  }

  const handleRoomMessage = async (roomId: string, event: any) => {
    // Handle incoming room messages
    if (event.type !== 'm.room.message') return

    // Process message based on type
    switch (event.content.msgtype) {
      case 'm.text':
        // Handle text message
        break
      case 'm.image':
        // Handle image message
        break
      case 'm.file':
        // Handle file message
        break
      case 'm.notice':
        // Handle notice/system message
        break
    }
  }

  const handleRoomJoin = (roomId: string, event: any) => {
    // Handle room join events
  }

  const handleRoomLeave = (roomId: string, event: any) => {
    // Handle room leave events
  }

  const sendMessage = useCallback(async (roomId: string, content: any) => {
    if (!client) throw new Error('Matrix client not initialized')

    try {
      await client.sendMessage(roomId, {
        msgtype: 'm.text',
        body: content.body,
        ...content
      })
    } catch (err) {
      setError(err)
      throw err
    }
  }, [client])

  const joinRoom = useCallback(async (roomId: string) => {
    if (!client) throw new Error('Matrix client not initialized')

    try {
      await client.joinRoom(roomId)
    } catch (err) {
      setError(err)
      throw err
    }
  }, [client])

  const createRoom = useCallback(async (options: {
    name: string
    topic?: string
    isPublic?: boolean
  }) => {
    if (!client) throw new Error('Matrix client not initialized')

    try {
      const roomId = await client.createRoom({
        name: options.name,
        topic: options.topic,
        visibility: options.isPublic ? 'public' : 'private',
        preset: options.isPublic ? 'public_chat' : 'private_chat',
        initial_state: [
          {
            type: 'm.room.history_visibility',
            state_key: '',
            content: {
              history_visibility: 'shared'
            }
          }
        ]
      })
      return roomId
    } catch (err) {
      setError(err)
      throw err
    }
  }, [client])

  return (
    <MatrixContext.Provider
      value={{
        client,
        isConnected,
        error,
        sendMessage,
        joinRoom,
        createRoom
      }}
    >
      {children}
    </MatrixContext.Provider>
  )
}

export function useMatrixClient() {
  const context = useContext(MatrixContext)
  if (!context) {
    throw new Error('useMatrixClient must be used within a MatrixProvider')
  }
  return context
} 