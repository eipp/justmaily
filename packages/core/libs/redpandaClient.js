import { Kafka } from 'kafkajs';

class RedpandaClient {
  constructor(config) {
    if (
      !config ||
      !config.brokers ||
      !Array.isArray(config.brokers) ||
      config.brokers.length === 0
    ) {
      throw new Error(
        'Invalid configuration for RedpandaClient. At least one broker must be provided.',
      );
    }
    this.config = config;
    this.kafka = new Kafka({
      clientId: config.clientId || 'redpanda-client',
      brokers: config.brokers,
      ssl: config.ssl || false,
      sasl: config.sasl || null,
    });

    this.producer = this.kafka.producer();
    this.consumer = this.kafka.consumer({
      groupId: config.groupId || 'redpanda-group',
    });
    this.connected = false;
  }

  async connect() {
    try {
      await this.producer.connect();
      await this.consumer.connect();
      this.connected = true;
      console.log('Successfully connected to Redpanda.');
    } catch (error) {
      console.error('Error connecting to Redpanda:', error);
      throw error;
    }
  }

  async disconnect() {
    try {
      await this.producer.disconnect();
      await this.consumer.disconnect();
      this.connected = false;
      console.log('Redpanda disconnected successfully.');
    } catch (error) {
      console.error('Error disconnecting from Redpanda:', error);
      throw error;
    }
  }

  ensureConnected() {
    if (!this.connected) {
      throw new Error(
        'Not connected to Redpanda. Please call connect() first.',
      );
    }
  }

  async sendMessage(topic, message) {
    if (!topic) {
      throw new Error('Topic must be provided to send a message.');
    }
    this.ensureConnected();
    try {
      const value =
        typeof message === 'object' ? JSON.stringify(message) : message;
      await this.producer.send({
        topic,
        messages: [{ value }],
      });
      console.log(`Message sent to topic ${topic}`);
    } catch (error) {
      console.error(`Error sending message to topic ${topic}:`, error);
      throw error;
    }
  }

  async subscribe(topic, callback) {
    if (!topic) {
      throw new Error('Topic must be provided for subscription.');
    }
    if (typeof callback !== 'function') {
      throw new Error(
        'A valid callback function must be provided for subscription.',
      );
    }
    this.ensureConnected();
    try {
      await this.consumer.subscribe({ topic, fromBeginning: true });
      await this.consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
          const value = message.value.toString();
          callback({ topic, partition, message: value });
        },
      });
    } catch (error) {
      console.error(`Error subscribing to topic ${topic}:`, error);
      throw error;
    }
  }
}

export default RedpandaClient;
