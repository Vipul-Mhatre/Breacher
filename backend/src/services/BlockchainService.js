const axios = require('axios');
const crypto = require('crypto');
const config = require('../config/config');

class BlockchainService {
  constructor() {
    this.baseUrl = config.blockchain.restApi;
  }

  async submitTransaction(payload) {
    try {
      const batchId = crypto.randomBytes(32).toString('hex');
      const response = await axios.post(`${this.baseUrl}/batches`, {
        batchId,
        transactions: [{
          payload: Buffer.from(JSON.stringify(payload)).toString('base64'),
          timestamp: new Date().toISOString()
        }]
      });
      return response.data;
    } catch (error) {
      console.error('Blockchain submission error:', error);
      throw error;
    }
  }

  async queryTransactions(filter = {}) {
    try {
      const response = await axios.get(`${this.baseUrl}/transactions`, {
        params: filter
      });
      return response.data;
    } catch (error) {
      console.error('Blockchain query error:', error);
      throw error;
    }
  }
}

module.exports = new BlockchainService(); 