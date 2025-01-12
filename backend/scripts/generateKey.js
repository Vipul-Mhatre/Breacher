const { createContext, CryptoFactory } = require('sawtooth-sdk/signing');
const { Secp256k1PrivateKey } = require('sawtooth-sdk/signing/secp256k1');
const context = createContext('secp256k1');
const privateKey = context.newRandomPrivateKey();
console.log('Private Key:', privateKey.asHex()); 