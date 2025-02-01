import { Connection, Client, TLSConfig } from '@temporalio/client';
import { Worker, NativeConnection } from '@temporalio/worker';
import pino from 'pino';

const logger = pino({
  name: 'temporal-core',
  level: process.env.LOG_LEVEL || 'info'
});

export interface TemporalConfig {
  address: string;
  namespace: string;
  taskQueue: string;
  clientCert?: string;
  clientKey?: string;
  caCert?: string;
}

export class TemporalService {
  private client!: Client;
  private config: TemporalConfig;

  constructor(config: TemporalConfig) {
    this.config = config;
  }

  async connect() {
    try {
      const connection = await Connection.connect({
        address: this.config.address,
        tls: this.getTlsConfig() as TLSConfig | undefined
      });

      this.client = new Client({
        connection,
        namespace: this.config.namespace
      });

      logger.info('Connected to Temporal server');
    } catch (error) {
      logger.error({ error }, 'Failed to connect to Temporal server');
      throw error;
    }
  }

  async createWorker(workflowsPath: string, activitiesPath: string) {
    try {
      const connection = await Connection.connect({
        address: this.config.address,
        tls: this.getTlsConfig() as TLSConfig | undefined
      });

      const worker = await Worker.create({
        workflowsPath,
        activities: require(activitiesPath),
        taskQueue: this.config.taskQueue,
        connection: connection as unknown as NativeConnection
      });

      await worker.run();
      logger.info('Temporal worker started');
      return worker;
    } catch (error) {
      logger.error({ error }, 'Failed to create Temporal worker');
      throw error;
    }
  }

  getClient(): Client {
    if (!this.client) {
      throw new Error('Temporal client not initialized. Call connect() first.');
    }
    return this.client;
  }

  private getTlsConfig() {
    if (this.config.clientCert && this.config.clientKey && this.config.caCert) {
      return {
        clientCert: this.config.clientCert,
        clientKey: this.config.clientKey,
        caCert: this.config.caCert
      };
    }
    return undefined;
  }
} 