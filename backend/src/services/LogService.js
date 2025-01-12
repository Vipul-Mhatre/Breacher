const { db } = require('../models');
const blockchain = require('../blockchain/Blockchain');

class LogService {
  static async createLog(logData) {
    try {
      // Save to JSON storage
      const log = {
        ...logData,
        timestamp: new Date(),
        isAnomaly: false
      };
      const savedLog = await db.logs.create(log);

      // Add to blockchain
      await blockchain.addLog(savedLog);

      return savedLog;
    } catch (error) {
      console.error('Error creating log:', error);
      throw error;
    }
  }

  static async verifyLogIntegrity(logId) {
    try {
      // Verify log exists in blockchain
      const verified = await blockchain.verifyLog(logId);
      
      if (verified) {
        // Get log from JSON storage
        const storedLog = await db.logs.findOne({ _id: logId });
        
        // Get block containing the log
        const block = blockchain.getBlockByLogId(logId);
        
        if (block) {
          // Find log in block
          const blockLog = block.data.find(log => log._id === logId);
          
          // Compare stored log with blockchain log
          return JSON.stringify(storedLog) === JSON.stringify(blockLog);
        }
      }
      
      return false;
    } catch (error) {
      console.error('Error verifying log integrity:', error);
      return false;
    }
  }

  static async getLogs(page = 1, limit = 10, filters = {}) {
    try {
      const logs = await db.logs.find(filters);
      
      // Manual pagination
      const start = (page - 1) * limit;
      const paginatedLogs = logs.slice(start, start + limit);
      
      return {
        logs: paginatedLogs,
        total: logs.length,
        page: page,
        pages: Math.ceil(logs.length / limit)
      };
    } catch (error) {
      console.error('Error getting logs:', error);
      throw error;
    }
  }
}

module.exports = LogService; 