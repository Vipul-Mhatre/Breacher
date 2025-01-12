const Block = require('./Block');
const fs = require('fs').promises;
const path = require('path');

class Blockchain {
  constructor() {
    this.chain = [];
    this.difficulty = 2;
    this.pendingLogs = [];
    this.blockchainFile = path.join(__dirname, '../data/blockchain.json');
  }

  async initialize() {
    try {
      const data = await fs.readFile(this.blockchainFile, 'utf8');
      this.chain = JSON.parse(data);
    } catch (error) {
      // If file doesn't exist, create genesis block
      const genesisBlock = new Block(Date.now(), { message: 'Genesis Block' }, '0');
      genesisBlock.mineBlock(this.difficulty);
      this.chain = [genesisBlock];
      await this.saveChain();
    }
  }

  async saveChain() {
    await fs.writeFile(
      this.blockchainFile,
      JSON.stringify(this.chain, null, 2)
    );
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  async addLog(logData) {
    this.pendingLogs.push(logData);
    
    // Create new block after 5 logs
    if (this.pendingLogs.length >= 5) {
      const block = new Block(
        Date.now(),
        this.pendingLogs,
        this.getLatestBlock().hash
      );
      
      block.mineBlock(this.difficulty);
      this.chain.push(block);
      this.pendingLogs = [];
      await this.saveChain();
    }
  }

  async verifyLog(logId) {
    // Check pending logs
    if (this.pendingLogs.some(log => log._id === logId)) {
      return true;
    }

    // Check mined blocks
    return this.chain.some(block => 
      block.data.some(log => log._id === logId)
    );
  }

  isChainValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      if (currentBlock.hash !== currentBlock.calculateHash()) {
        return false;
      }

      if (currentBlock.previousHash !== previousBlock.hash) {
        return false;
      }
    }
    return true;
  }

  getBlockByLogId(logId) {
    return this.chain.find(block => 
      block.data.some(log => log._id === logId)
    );
  }
}

module.exports = new Blockchain(); 