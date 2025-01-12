const { Gateway, Wallets } = require('fabric-network');
const path = require('path');
const fs = require('fs');

class BlockchainService {
  static async initialize() {
    try {
      // Load connection profile
      const ccpPath = path.resolve(__dirname, '..', 'config', 'connection-profile.json');
      const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

      // Create a new file system based wallet for managing identities
      const walletPath = path.join(process.cwd(), 'wallet');
      const wallet = await Wallets.newFileSystemWallet(walletPath);

      // Create a new gateway for connecting to the peer node
      const gateway = new Gateway();
      await gateway.connect(ccp, {
        wallet,
        identity: 'admin',
        discovery: { enabled: true, asLocalhost: true }
      });

      return gateway;
    } catch (error) {
      console.error('Failed to initialize blockchain:', error);
      throw error;
    }
  }

  static async addToBlockchain(logData) {
    try {
      const gateway = await this.initialize();
      
      // Get the network (channel) our contract is deployed to
      const network = await gateway.getNetwork('mychannel');
      
      // Get the contract from the network
      const contract = network.getContract('logcontract');

      // Submit the transaction
      const result = await contract.submitTransaction(
        'createLog',
        JSON.stringify({
          ...logData,
          timestamp: new Date().toISOString(),
          type: 'security_log'
        })
      );

      await gateway.disconnect();
      return result;
    } catch (error) {
      console.error('Failed to add to blockchain:', error);
      throw error;
    }
  }

  static async queryLogs(queryParams) {
    try {
      const gateway = await this.initialize();
      const network = await gateway.getNetwork('mychannel');
      const contract = network.getContract('logcontract');

      const result = await contract.evaluateTransaction(
        'queryLogs',
        JSON.stringify(queryParams)
      );

      await gateway.disconnect();
      return JSON.parse(result.toString());
    } catch (error) {
      console.error('Failed to query blockchain:', error);
      throw error;
    }
  }
}

module.exports = BlockchainService; 