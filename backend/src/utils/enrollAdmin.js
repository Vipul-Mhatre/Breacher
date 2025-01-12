const FabricCAServices = require('fabric-ca-client');
const { Wallets } = require('fabric-network');
const fs = require('fs');
const path = require('path');
const config = require('../config/config');

async function enrollAdmin() {
  try {
    // Load the network configuration
    const ccpPath = path.resolve(__dirname, '..', 'config', 'connection-profile.json');
    const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

    // Create a new CA client for interacting with the CA
    const caInfo = ccp.certificateAuthorities['ca.org1.example.com'];
    const caTLSCACerts = caInfo.tlsCACerts.path;
    const ca = new FabricCAServices(caInfo.url, { 
      trustedRoots: caTLSCACerts, 
      verify: false 
    }, caInfo.caName);

    // Create a new file system based wallet for managing identities
    const walletPath = path.join(process.cwd(), config.blockchain.walletPath);
    const wallet = await Wallets.newFileSystemWallet(walletPath);

    // Check if admin is already enrolled
    const identity = await wallet.get('admin');
    if (identity) {
      console.log('Admin is already enrolled');
      return;
    }

    // Enroll the admin user
    const enrollment = await ca.enroll({ 
      enrollmentID: 'admin', 
      enrollmentSecret: 'adminpw' 
    });

    const x509Identity = {
      credentials: {
        certificate: enrollment.certificate,
        privateKey: enrollment.key.toBytes(),
      },
      mspId: 'Org1MSP',
      type: 'X.509',
    };

    await wallet.put('admin', x509Identity);
    console.log('Successfully enrolled admin user and imported it into the wallet');

  } catch (error) {
    console.error(`Failed to enroll admin user: ${error}`);
    throw error;
  }
}

module.exports = enrollAdmin; 