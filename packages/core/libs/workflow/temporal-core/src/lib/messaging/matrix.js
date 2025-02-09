'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.MatrixMessaging = void 0;
const matrix_bot_sdk_1 = require('matrix-bot-sdk');
class MatrixMessaging {
  constructor(config, metrics, security) {
    this.config = config;
    this.metrics = metrics;
    this.security = security;
    this.rooms = new Map();
    this.encryptedRooms = new Set();
    const storage = new matrix_bot_sdk_1.SimpleFsStorageProvider(
      'matrix-store.json',
    );
    this.client = new matrix_bot_sdk_1.MatrixClient(
      config.homeserverUrl,
      config.accessToken,
      storage,
    );
    if (config.autoJoin) {
      matrix_bot_sdk_1.AutojoinRoomsMixin.setupOnClient(this.client);
    }
    void this.setupClient();
  }
  // Connection Management
  async connect() {
    try {
      const startTime = Date.now();
      await this.client.start();
      await this.metrics.recordLatency(
        'matrix_connect',
        Date.now() - startTime,
      );
      await this.setupEncryption();
      await this.syncRooms();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      await this.metrics.recordError('matrix_connect', errorMessage);
      throw error;
    }
  }
  async disconnect() {
    try {
      await this.client.stop();
      await this.metrics.recordEvent('matrix_disconnect');
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      await this.metrics.recordError('matrix_disconnect', errorMessage);
      throw error;
    }
  }
  // Messaging
  async sendMessage(content, options = {}) {
    const roomId = options.roomId || this.config.defaultRoom;
    if (!roomId) {
      throw new Error('Room ID is required');
    }
    try {
      const startTime = Date.now();
      const messageContent = await this.prepareMessage(content, options);
      const eventId = await this.client.sendMessage(roomId, messageContent);
      const duration = Date.now() - startTime;
      await this.metrics.recordLatency('matrix_send_message', duration);
      await this.metrics.recordEvent('matrix_message_sent');
      return eventId;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      await this.metrics.recordError('matrix_send_message', errorMessage);
      throw error;
    }
  }
  async sendNotification(title, body, options = {}) {
    try {
      const messageContent = {
        msgtype: 'm.notification',
        body,
        title,
        priority: options.priority || 'normal',
        metadata: options.metadata,
      };
      return await this.sendMessage(JSON.stringify(messageContent), options);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      await this.metrics.recordError('matrix_send_notification', errorMessage);
      throw error;
    }
  }
  // Room Management
  async createRoom(name, options = {}) {
    try {
      const startTime = Date.now();
      const createOptions = {
        name,
        topic: options.topic,
        visibility: options.isPublic
          ? matrix_bot_sdk_1.RoomVisibility.Public
          : matrix_bot_sdk_1.RoomVisibility.Private,
        initial_state: options.encrypted
          ? [
              {
                type: 'm.room.encryption',
                state_key: '',
                content: {
                  algorithm: 'm.megolm.v1.aes-sha2',
                },
              },
            ]
          : [],
        invite: options.inviteUsers,
      };
      const roomId = await this.client.createRoom(createOptions);
      if (options.encrypted) {
        await this.enableEncryption(roomId);
      }
      const duration = Date.now() - startTime;
      await this.metrics.recordLatency('matrix_create_room', duration);
      await this.metrics.recordEvent('matrix_room_created');
      return roomId;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      await this.metrics.recordError('matrix_create_room', errorMessage);
      throw error;
    }
  }
  async joinRoom(roomIdOrAlias) {
    try {
      const startTime = Date.now();
      await this.client.joinRoom(roomIdOrAlias);
      const duration = Date.now() - startTime;
      await this.metrics.recordLatency('matrix_join_room', duration);
      await this.metrics.recordEvent('matrix_room_joined');
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      await this.metrics.recordError('matrix_join_room', errorMessage);
      throw error;
    }
  }
  // Event Handling
  onMessage(callback) {
    this.client.on('room.message', async (roomId, event) => {
      try {
        await callback(roomId, event);
        await this.metrics.recordEvent('matrix_message_received');
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        await this.metrics.recordError('matrix_message_handler', errorMessage);
      }
    });
  }
  onStateChange(callback) {
    this.client.on('room.state_changed', async (roomId, event) => {
      try {
        await callback(roomId, event);
        await this.metrics.recordEvent('matrix_state_changed');
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        await this.metrics.recordError('matrix_state_handler', errorMessage);
      }
    });
  }
  // Private Methods
  async setupClient() {
    this.client.on('room.encrypted_message', async (roomId, event) => {
      await this.handleEncryptedMessage(roomId, event);
    });
    this.client.on('room.failed_decryption', async (roomId, event, error) => {
      await this.metrics.recordError('matrix_decryption_failed', error.message);
    });
    this.setupMetrics();
  }
  async setupEncryption() {
    var _a;
    if (
      !((_a = this.config.encryption) === null || _a === void 0
        ? void 0
        : _a.enabled)
    )
      return;
    try {
      // Note: initCrypto is not available in the current version
      // We'll need to handle encryption differently
      await this.metrics.recordEvent('matrix_encryption_setup');
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      await this.metrics.recordError('matrix_encryption_setup', errorMessage);
      throw error;
    }
  }
  async syncRooms() {
    var _a, _b, _c;
    try {
      const joinedRooms = await this.client.getJoinedRooms();
      for (const roomId of joinedRooms) {
        const state = await this.client.getRoomState(roomId);
        const nameEvent = state.find((e) => e.type === 'm.room.name');
        const topicEvent = state.find((e) => e.type === 'm.room.topic');
        const membersEvent = state.find((e) => e.type === 'm.room.members');
        const encryptionEvent = state.find(
          (e) => e.type === 'm.room.encryption',
        );
        if (encryptionEvent) {
          this.encryptedRooms.add(roomId);
        }
        this.rooms.set(roomId, {
          name:
            ((_a =
              nameEvent === null || nameEvent === void 0
                ? void 0
                : nameEvent.content) === null || _a === void 0
              ? void 0
              : _a.name) || roomId,
          topic:
            (_b =
              topicEvent === null || topicEvent === void 0
                ? void 0
                : topicEvent.content) === null || _b === void 0
              ? void 0
              : _b.topic,
          memberCount:
            ((_c =
              membersEvent === null || membersEvent === void 0
                ? void 0
                : membersEvent.content) === null || _c === void 0
              ? void 0
              : _c.count) || 0,
          isEncrypted: Boolean(encryptionEvent),
          lastActivity: new Date(),
        });
      }
      await this.metrics.recordEvent('matrix_rooms_synced');
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      await this.metrics.recordError('matrix_room_sync', errorMessage);
      throw error;
    }
  }
  async prepareMessage(content, options) {
    const messageContent = {
      msgtype: 'm.text',
      body: content,
    };
    if (options.formatted) {
      messageContent.format = 'org.matrix.custom.html';
      messageContent.formatted_body = content;
    }
    if (options.threadId) {
      messageContent['m.relates_to'] = {
        rel_type: 'm.thread',
        event_id: options.threadId,
      };
    }
    if (options.replyTo) {
      messageContent['m.relates_to'] = Object.assign(
        Object.assign({}, messageContent['m.relates_to']),
        {
          'm.in_reply_to': {
            event_id: options.replyTo,
          },
        },
      );
    }
    if (options.ttl) {
      messageContent.ttl = options.ttl;
    }
    return messageContent;
  }
  async handleEncryptedMessage(roomId, event) {
    try {
      if (!this.encryptedRooms.has(roomId)) {
        this.encryptedRooms.add(roomId);
      }
      await this.metrics.recordEvent('matrix_encrypted_message_handled');
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      await this.metrics.recordError(
        'matrix_encrypted_message_handler',
        errorMessage,
      );
    }
  }
  async enableEncryption(roomId) {
    try {
      await this.client.sendStateEvent(roomId, 'm.room.encryption', '', {
        algorithm: 'm.megolm.v1.aes-sha2',
      });
      this.encryptedRooms.add(roomId);
      await this.metrics.recordEvent('matrix_room_encryption_enabled');
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      await this.metrics.recordError('matrix_enable_encryption', errorMessage);
      throw error;
    }
  }
  setupMetrics() {
    // Monitor room count
    setInterval(async () => {
      const joinedRooms = await this.client.getJoinedRooms();
      await this.metrics.recordMetric(
        'matrix_joined_rooms',
        joinedRooms.length,
      );
      await this.metrics.recordMetric(
        'matrix_encrypted_rooms',
        this.encryptedRooms.size,
      );
    }, 60000); // Every minute
  }
}
exports.MatrixMessaging = MatrixMessaging;
