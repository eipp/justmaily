import SnowflakeClient from './snowflakeClient.js';
import RedpandaClient from './redpandaClient.js';
import DataLake from './dataLake.js';
import PrivacyConsent from './privacyConsent.js';
import MaterializedViews from './materializedViews.js';
import IPFSStorage from './ipfsStorage.js';

class NextGenDataInfrastructure {
  constructor(config = {}) {
    if (!config) {
      throw new Error(
        'Configuration object is required for NextGenDataInfrastructure.',
      );
    }
    if (!config.snowflake || !config.redpanda) {
      throw new Error(
        'Both Snowflake and Redpanda configurations are required.',
      );
    }
    // Initialize clients and modules
    this.snowflakeClient = new SnowflakeClient(config.snowflake);
    this.redpandaClient = new RedpandaClient(config.redpanda);
    this.dataLake = new DataLake(config.dataLake);
    this.privacyConsent = new PrivacyConsent(config.privacyConsent);
    this.materializedViews = new MaterializedViews(config.materializedViews);
    this.ipfsStorage = new IPFSStorage(config.ipfsStorage);
  }

  // Initialization routine: concurrently connect to Snowflake and Redpanda.
  async init() {
    try {
      const connections = [];
      // Connect to Snowflake
      connections.push(this.snowflakeClient.connect());
      // Connect to Redpanda
      connections.push(this.redpandaClient.connect());
      // Await all connections concurrently
      await Promise.all(connections);
      console.log(
        'NextGenDataInfrastructure initialized. All platforms connected.',
      );
    } catch (error) {
      console.error(
        'Error during NextGenDataInfrastructure initialization:',
        error,
      );
      // If any connection fails, attempt graceful shutdown
      await this.shutdown();
      throw new Error(
        'Initialization failed. Components could not be connected.',
      );
    }
  }

  // Gracefully shut down components
  async shutdown() {
    try {
      // Shutdown Redpanda; Snowflake library doesn't have a disconnect so we skip that
      await this.redpandaClient.disconnect();
      console.log('NextGenDataInfrastructure shut down gracefully.');
    } catch (error) {
      console.error('Error during shutdown:', error);
    }
  }

  // Process an incoming event by routing it through various systems
  async processEvent(event) {
    if (!event || typeof event !== 'object') {
      throw new Error('A valid event object must be provided.');
    }
    try {
      // Store event in Snowflake (zero-party data hub)
      await this.snowflakeClient.insert('zero_party_data', event);

      // Stream event in real-time via Redpanda
      await this.redpandaClient.sendMessage('events', event);

      // Store event data in the data lake (stub)
      await this.dataLake.storeData('events_table', event);

      // Update real-time materialized views (stub)
      await this.materializedViews.updateView(
        'events_view',
        'SELECT * FROM events_table',
      );

      // Record privacy consent if provided
      if (event.userId && event.consent) {
        await this.privacyConsent.recordConsent(event.userId, event.consent);
      }

      console.log('Event processed successfully.');
      return true;
    } catch (error) {
      console.error('Error processing event:', error);
      return false;
    }
  }

  // Archive an event on IPFS for decentralized, resilient storage
  async archiveEvent(event) {
    if (!event || typeof event !== 'object') {
      throw new Error('A valid event object must be provided for archiving.');
    }
    try {
      const eventData = JSON.stringify(event);
      const cid = await this.ipfsStorage.storeData(eventData);
      console.log('Event archived on IPFS with CID:', cid);
      return cid;
    } catch (error) {
      console.error('Error archiving event on IPFS:', error);
      return null;
    }
  }
}

export default NextGenDataInfrastructure;
