import { createContext, useContext, useEffect, useState } from 'react'
import { createClient, MatrixClient } from 'matrix-js-sdk'
import { useSession } from './supabase'

interface MatrixContextType {
  client: MatrixClient | null
  isConnected: boolean
  isLoading: boolean
  error: Error | null
  joinRoom: (roomId: string) => Promise<void>
  leaveRoom: (roomId: string) => Promise<void>
  sendMessage: (roomId: string, content: any) => Promise<void>
  setPresence: (presence: 'online' | 'offline' | 'unavailable') => Promise<void>
}

const MatrixContext = createContext<MatrixContextType | undefined>(undefined)

export function MatrixProvider({ children }: { children: React.ReactNode }) {
  const [client, setClient] = useState<MatrixClient | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const { session } = useSession()

  useEffect(() => {
    if (!session?.user) {
      setClient(null)
      setIsConnected(false)
      setIsLoading(false)
      return
    }

    const initMatrix = async () => {
      try {
        const matrixClient = createClient({
          baseUrl: process.env.NEXT_PUBLIC_MATRIX_SERVER_URL!,
          userId: session.user.id,
          accessToken: session.access_token,
        })

        await matrixClient.startClient({ initialSyncLimit: 10 })

        matrixClient.on('sync', (state: string) => {
          switch (state) {
            case 'PREPARED':
              setIsConnected(true)
              setIsLoading(false)
              break
            case 'ERROR':
              setError(new Error('Matrix sync error'))
              setIsLoading(false)
              break
          }
        })

        setClient(matrixClient)
      } catch (err) {
        setError(err as Error)
        setIsLoading(false)
      }
    }

    initMatrix()

    return () => {
      if (client) {
        client.stopClient()
        setClient(null)
        setIsConnected(false)
      }
    }
  }, [session])

  const joinRoom = async (roomId: string) => {
    if (!client) throw new Error('Matrix client not initialized')
    await client.joinRoom(roomId)
  }

  const leaveRoom = async (roomId: string) => {
    if (!client) throw new Error('Matrix client not initialized')
    await client.leave(roomId)
  }

  const sendMessage = async (roomId: string, content: any) => {
    if (!client) throw new Error('Matrix client not initialized')
    await client.sendMessage(roomId, {
      msgtype: 'm.room.message',
      body: JSON.stringify(content),
      content,
    })
  }

  const setPresence = async (presence: 'online' | 'offline' | 'unavailable') => {
    if (!client) throw new Error('Matrix client not initialized')
    await client.setPresence(presence)
  }

  return (
    <MatrixContext.Provider
      value={{
        client,
        isConnected,
        isLoading,
        error,
        joinRoom,
        leaveRoom,
        sendMessage,
        setPresence,
      }}
    >
      {children}
    </MatrixContext.Provider>
  )
}

export function useMatrix() {
  const context = useContext(MatrixContext)
  if (context === undefined) {
    throw new Error('useMatrix must be used within a MatrixProvider')
  }
  return context
}

export function useMatrixRoom(roomId: string) {
  const { client } = useMatrix()
  const [messages, setMessages] = useState<any[]>([])
  const [members, setMembers] = useState<any[]>([])

  useEffect(() => {
    if (!client || !roomId) return

    const room = client.getRoom(roomId)
    if (!room) return

    const handleMessage = (event: any) => {
      if (event.getRoomId() === roomId) {
        setMessages((prev) => [...prev, event])
      }
    }

    const handleMembership = () => {
      const room = client.getRoom(roomId)
      if (room) {
        setMembers(Array.from(room.getMembers()))
      }
    }

    client.on('Room.timeline', handleMessage)
    client.on('RoomMember.membership', handleMembership)

    // Initial state
    setMessages(room.timeline || [])
    setMembers(Array.from(room.getMembers()))

    return () => {
      client.removeListener('Room.timeline', handleMessage)
      client.removeListener('RoomMember.membership', handleMembership)
    }
  }, [client, roomId])

  return { messages, members }
} 