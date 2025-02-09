'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.TemporalService = void 0;
const client_1 = require('@temporalio/client');
const worker_1 = require('@temporalio/worker');
const pino_1 = __importDefault(require('pino'));
const logger = (0, pino_1.default)({
  name: 'temporal-core',
  level: process.env.LOG_LEVEL || 'info',
});
class TemporalService {
  constructor(config) {
    this.config = config;
  }
  async connect() {
    try {
      const connection = await client_1.Connection.connect({
        address: this.config.address,
        tls: this.getTlsConfig(),
      });
      this.client = new client_1.Client({
        connection,
        namespace: this.config.namespace,
      });
      logger.info('Connected to Temporal server');
    } catch (error) {
      logger.error({ error }, 'Failed to connect to Temporal server');
      throw error;
    }
  }
  async createWorker(workflowsPath, activitiesPath) {
    try {
      const connection = await client_1.Connection.connect({
        address: this.config.address,
        tls: this.getTlsConfig(),
      });
      const worker = await worker_1.Worker.create({
        workflowsPath,
        activities: require(activitiesPath),
        taskQueue: this.config.taskQueue,
        connection: connection,
      });
      await worker.run();
      logger.info('Temporal worker started');
      return worker;
    } catch (error) {
      logger.error({ error }, 'Failed to create Temporal worker');
      throw error;
    }
  }
  getClient() {
    if (!this.client) {
      throw new Error('Temporal client not initialized. Call connect() first.');
    }
    return this.client;
  }
  getTlsConfig() {
    if (this.config.clientCert && this.config.clientKey && this.config.caCert) {
      return {
        clientCert: this.config.clientCert,
        clientKey: this.config.clientKey,
        caCert: this.config.caCert,
      };
    }
    return undefined;
  }
}
exports.TemporalService = TemporalService;
