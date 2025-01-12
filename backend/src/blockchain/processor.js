const { TransactionProcessor } = require('sawtooth-sdk/processor');
const LogHandler = require('./handler');

const address = process.env.VALIDATOR_URL || 'tcp://localhost:4004';
const processor = new TransactionProcessor(address);

processor.addHandler(new LogHandler());
processor.start();

console.log(`Starting transaction processor at ${address}`); 