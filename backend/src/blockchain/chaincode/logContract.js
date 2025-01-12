const { Contract } = require('fabric-contract-api');
const crypto = require('crypto');

class LogContract extends Contract {
  constructor() {
    super('LogContract');
  }

  // Initialize the chaincode
  async initLedger(ctx) {
    console.info('============= START : Initialize Ledger ===========');
    console.info('============= END : Initialize Ledger ===========');
  }

  // Create a new log entry
  async createLog(ctx, logDataStr) {
    console.info('============= START : Create Log ===========');
    
    const logData = JSON.parse(logDataStr);
    const logId = this.generateLogId(logData);
    
    // Add metadata
    const log = {
      ...logData,
      id: logId,
      createdAt: new Date().toISOString(),
      hash: this.calculateHash(logData)
    };

    await ctx.stub.putState(logId, Buffer.from(JSON.stringify(log)));
    console.info('============= END : Create Log ===========');
    return JSON.stringify(log);
  }

  // Query logs with pagination
  async queryLogs(ctx, queryString) {
    console.info('============= START : Query Logs ===========');
    
    const query = JSON.parse(queryString);
    let queryResults = await this.getQueryResultForQueryString(ctx, query);
    
    console.info('============= END : Query Logs ===========');
    return JSON.stringify(queryResults);
  }

  // Get log by ID
  async getLog(ctx, logId) {
    console.info('============= START : Get Log ===========');
    
    const logAsBytes = await ctx.stub.getState(logId);
    if (!logAsBytes || logAsBytes.length === 0) {
      throw new Error(`Log ${logId} does not exist`);
    }
    
    console.info('============= END : Get Log ===========');
    return logAsBytes.toString();
  }

  // Verify log integrity
  async verifyLog(ctx, logId) {
    console.info('============= START : Verify Log ===========');
    
    const logAsBytes = await ctx.stub.getState(logId);
    if (!logAsBytes || logAsBytes.length === 0) {
      throw new Error(`Log ${logId} does not exist`);
    }

    const log = JSON.parse(logAsBytes.toString());
    const calculatedHash = this.calculateHash({
      ...log,
      hash: undefined // Exclude the stored hash from calculation
    });

    const isValid = calculatedHash === log.hash;
    
    console.info('============= END : Verify Log ===========');
    return JSON.stringify({ isValid, log });
  }

  // Helper function to generate unique log ID
  generateLogId(logData) {
    return crypto
      .createHash('sha256')
      .update(`${logData.userId}-${logData.timestamp}-${Date.now()}`)
      .digest('hex');
  }

  // Helper function to calculate hash of log data
  calculateHash(data) {
    return crypto
      .createHash('sha256')
      .update(JSON.stringify(data))
      .digest('hex');
  }

  // Helper function for querying with pagination
  async getQueryResultForQueryString(ctx, query) {
    const { selector, limit = 10, bookmark = '' } = query;
    
    const { iterator, metadata } = await ctx.stub.getQueryResultWithPagination(
      JSON.stringify({ selector }), 
      limit, 
      bookmark
    );

    const results = [];
    let count = 0;

    while (true) {
      const result = await iterator.next();
      if (result.value && result.value.value.toString()) {
        const jsonRes = JSON.parse(result.value.value.toString('utf8'));
        results.push(jsonRes);
        count++;
      }

      if (result.done) {
        await iterator.close();
        break;
      }
    }

    return {
      results,
      count,
      metadata
    };
  }
}

module.exports = LogContract; 