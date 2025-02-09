import { create } from 'ipfs-http-client';

class IPFSStorage {
  constructor(config = {}) {
    this.ipfs = create({ url: config.url || 'http://localhost:5001' });
  }

  // Stores data on IPFS and returns the CID
  async storeData(data) {
    if (!data) {
      throw new Error('Data must be provided for storing in IPFS.');
    }
    try {
      const { cid } = await this.ipfs.add(data);
      console.log('Stored data on IPFS with CID:', cid.toString());
      return cid.toString();
    } catch (error) {
      console.error('Error storing data on IPFS:', error);
      throw error;
    }
  }

  // Retrieves data from IPFS using the CID
  async retrieveData(cid) {
    if (!cid) {
      throw new Error('CID must be provided to retrieve data from IPFS.');
    }
    try {
      const stream = this.ipfs.cat(cid);
      let data = '';
      for await (const chunk of stream) {
        data += chunk.toString();
      }
      return data;
    } catch (error) {
      console.error('Error retrieving data from IPFS:', error);
      throw error;
    }
  }
}

export default IPFSStorage;
