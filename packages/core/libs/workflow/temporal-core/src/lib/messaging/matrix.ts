import { MatrixClient, SimpleFsStorageProvider, AutojoinRoomsMixin, RoomEvent, StateEvent, RoomCreateOptions, RoomVisibility } from 'matrix-bot-sdk'
import { MetricsService } from '../../monitoring/metrics'
import { SecurityService } from '../../../maily-deliver/src/lib/security'

interface MatrixConfig {
  homeserverUrl: string
  accessToken: string
  userId: string
  defaultRoom?: string
  autoJoin?: boolean
  encryption?: {
    enabled: boolean
    keyBackupEnabled?: boolean
    deviceId?: string
  }
  retryOptions?: {
    maxAttempts: number
    initialDelay: number
    maxDelay: number
  }
}

interface MessageOptions {
  roomId?: string
  threadId?: string
  replyTo?: string
  formatted?: boolean
  priority?: 'low' | 'normal' | 'high' | 'urgent'
  ttl?: number
  metadata?: Record<string, any>
}

interface RoomInfo {
  name: string
  topic?: string
  memberCount: number
  isEncrypted: boolean
  lastActivity: Date
}

export class MatrixMessaging {
  private client: MatrixClient
  private rooms: Map<string, RoomInfo> = new Map()
  private encryptedRooms: Set<string> = new Set()
  
  constructor(
    private config: MatrixConfig,
    private metrics: MetricsService,
    private security: SecurityService
  ) {
    const storage = new SimpleFsStorageProvider('matrix-store.json')
    
    this.client = new MatrixClient(
      config.homeserverUrl,
      config.accessToken,
      storage
    )

    if (config.autoJoin) {
      AutojoinRoomsMixin.setupOnClient(this.client)
    }

    void this.setupClient()
  }

  // Connection Management
  async connect(): Promise<void> {
    try {
      const startTime = Date.now()
      await this.client.start()
      
      await this.metrics.recordLatency(
        'matrix_connect',
        Date.now() - startTime
      )
      
      await this.setupEncryption()
      await this.syncRooms()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      await this.metrics.recordError('matrix_connect', errorMessage)
      throw error
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.client.stop()
      await this.metrics.recordEvent('matrix_disconnect')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      await this.metrics.recordError('matrix_disconnect', errorMessage)
      throw error
    }
  }

  // Messaging
  async sendMessage(
    content: string,
    options: MessageOptions = {}
  ): Promise<string> {
    const roomId = options.roomId || this.config.defaultRoom
    if (!roomId) {
      throw new Error('Room ID is required')
    }

    try {
      const startTime = Date.now()
      
      const messageContent = await this.prepareMessage(content, options)
      const eventId = await this.client.sendMessage(roomId, messageContent)
      
      const duration = Date.now() - startTime
      await this.metrics.recordLatency('matrix_send_message', duration)
      await this.metrics.recordEvent('matrix_message_sent')
      
      return eventId
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      await this.metrics.recordError('matrix_send_message', errorMessage)
      throw error
    }
  }

  async sendNotification(
    title: string,
    body: string,
    options: MessageOptions = {}
  ): Promise<string> {
    try {
      const messageContent = {
        msgtype: 'm.notification',
        body,
        title,
        priority: options.priority || 'normal',
        metadata: options.metadata
      }

      return await this.sendMessage(JSON.stringify(messageContent), options)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      await this.metrics.recordError('matrix_send_notification', errorMessage)
      throw error
    }
  }

  // Room Management
  async createRoom(
    name: string,
    options: {
      topic?: string
      isPublic?: boolean
      encrypted?: boolean
      inviteUsers?: string[]
    } = {}
  ): Promise<string> {
    try {
      const startTime = Date.now()
      
      const createOptions: RoomCreateOptions = {
        name,
        topic: options.topic,
        visibility: options.isPublic ? RoomVisibility.Public : RoomVisibility.Private,
        initial_state: options.encrypted ? [{
          type: 'm.room.encryption',
          state_key: '',
          content: {
            algorithm: 'm.megolm.v1.aes-sha2'
          }
        }] : [],
        invite: options.inviteUsers
      }

      const roomId = await this.client.createRoom(createOptions)

      if (options.encrypted) {
        await this.enableEncryption(roomId)
      }

      const duration = Date.now() - startTime
      await this.metrics.recordLatency('matrix_create_room', duration)
      await this.metrics.recordEvent('matrix_room_created')
      
      return roomId
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      await this.metrics.recordError('matrix_create_room', errorMessage)
      throw error
    }
  }

  async joinRoom(roomIdOrAlias: string): Promise<void> {
    try {
      const startTime = Date.now()
      await this.client.joinRoom(roomIdOrAlias)
      
      const duration = Date.now() - startTime
      await this.metrics.recordLatency('matrix_join_room', duration)
      await this.metrics.recordEvent('matrix_room_joined')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      await this.metrics.recordError('matrix_join_room', errorMessage)
      throw error
    }
  }

  // Event Handling
  onMessage(
    callback: (roomId: string, event: RoomEvent) => Promise<void>
  ): void {
    this.client.on('room.message', async (roomId: string, event: RoomEvent) => {
      try {
        await callback(roomId, event)
        await this.metrics.recordEvent('matrix_message_received')
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        await this.metrics.recordError('matrix_message_handler', errorMessage)
      }
    })
  }

  onStateChange(
    callback: (roomId: string, event: StateEvent) => Promise<void>
  ): void {
    this.client.on('room.state_changed', async (roomId: string, event: StateEvent) => {
      try {
        await callback(roomId, event)
        await this.metrics.recordEvent('matrix_state_changed')
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        await this.metrics.recordError('matrix_state_handler', errorMessage)
      }
    })
  }

  // Private Methods
  private async setupClient(): Promise<void> {
    this.client.on('room.encrypted_message', async (roomId: string, event: RoomEvent) => {
      await this.handleEncryptedMessage(roomId, event)
    })

    this.client.on('room.failed_decryption', async (roomId: string, event: RoomEvent, error: Error) => {
      await this.metrics.recordError('matrix_decryption_failed', error.message)
    })

    this.setupMetrics()
  }

  private async setupEncryption(): Promise<void> {
    if (!this.config.encryption?.enabled) return

    try {
      // Note: initCrypto is not available in the current version
      // We'll need to handle encryption differently
      await this.metrics.recordEvent('matrix_encryption_setup')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      await this.metrics.recordError('matrix_encryption_setup', errorMessage)
      throw error
    }
  }

  private async syncRooms(): Promise<void> {
    try {
      const joinedRooms = await this.client.getJoinedRooms()
      
      for (const roomId of joinedRooms) {
        const state = await this.client.getRoomState(roomId)
        const nameEvent = state.find(e => e.type === 'm.room.name')
        const topicEvent = state.find(e => e.type === 'm.room.topic')
        const membersEvent = state.find(e => e.type === 'm.room.members')
        const encryptionEvent = state.find(e => e.type === 'm.room.encryption')
        
        if (encryptionEvent) {
          this.encryptedRooms.add(roomId)
        }
        
        this.rooms.set(roomId, {
          name: nameEvent?.content?.name || roomId,
          topic: topicEvent?.content?.topic,
          memberCount: membersEvent?.content?.count || 0,
          isEncrypted: Boolean(encryptionEvent),
          lastActivity: new Date()
        })
      }
      
      await this.metrics.recordEvent('matrix_rooms_synced')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      await this.metrics.recordError('matrix_room_sync', errorMessage)
      throw error
    }
  }

  private async prepareMessage(
    content: string,
    options: MessageOptions
  ): Promise<Record<string, any>> {
    const messageContent: Record<string, any> = {
      msgtype: 'm.text',
      body: content
    }

    if (options.formatted) {
      messageContent.format = 'org.matrix.custom.html'
      messageContent.formatted_body = content
    }

    if (options.threadId) {
      messageContent['m.relates_to'] = {
        rel_type: 'm.thread',
        event_id: options.threadId
      }
    }

    if (options.replyTo) {
      messageContent['m.relates_to'] = {
        ...messageContent['m.relates_to'],
        'm.in_reply_to': {
          event_id: options.replyTo
        }
      }
    }

    if (options.ttl) {
      messageContent.ttl = options.ttl
    }

    return messageContent
  }

  private async handleEncryptedMessage(
    roomId: string,
    event: RoomEvent
  ): Promise<void> {
    try {
      if (!this.encryptedRooms.has(roomId)) {
        this.encryptedRooms.add(roomId)
      }
      
      await this.metrics.recordEvent('matrix_encrypted_message_handled')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      await this.metrics.recordError('matrix_encrypted_message_handler', errorMessage)
    }
  }

  private async enableEncryption(roomId: string): Promise<void> {
    try {
      await this.client.sendStateEvent(
        roomId,
        'm.room.encryption',
        '',
        {
          algorithm: 'm.megolm.v1.aes-sha2'
        }
      )
      
      this.encryptedRooms.add(roomId)
      await this.metrics.recordEvent('matrix_room_encryption_enabled')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      await this.metrics.recordError('matrix_enable_encryption', errorMessage)
      throw error
    }
  }

  private setupMetrics(): void {
    // Monitor room count
    setInterval(async () => {
      const joinedRooms = await this.client.getJoinedRooms()
      await this.metrics.recordMetric('matrix_joined_rooms', joinedRooms.length)
      await this.metrics.recordMetric('matrix_encrypted_rooms', this.encryptedRooms.size)
    }, 60000) // Every minute
  }
} 