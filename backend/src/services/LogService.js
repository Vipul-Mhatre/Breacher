const { Log } = require('../models');
const BlockchainService = require('./BlockchainService');

class LogService {
  async createLog(logData) {
    try {
      // Save to MongoDB
      const log = new Log(logData);
      await log.save();

      // Submit to blockchain
      await BlockchainService.submitTransaction({
        type: 'log',
        data: {
          id: log._id.toString(),
          ...logData
        }
      });

      return log;
    } catch (error) {
      console.error('Error creating log:', error);
      throw error;
    }
  }

  async getLogs(query, page = 1, limit = 10) {
    try {
      const logs = await Log.find(query)
        .sort({ timestamp: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

      const total = await Log.countDocuments(query);

      return {
        logs,
        total,
        page,
        pages: Math.ceil(total / limit)
      };
    } catch (error) {
      console.error('Error fetching logs:', error);
      throw error;
    }
  }

  async getAnomalies(page = 1, limit = 10) {
    return this.getLogs({ isAnomaly: true }, page, limit);
  }
}

module.exports = new LogService(); 