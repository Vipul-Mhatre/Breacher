const { TransactionProcessor } = require('sawtooth-sdk/processor');
const LogHandler = require('./handlers/LogHandler');

const VALIDATOR_URL = process.env.VALIDATOR_URL || 'tcp://localhost:4004';

// Start Transaction Processor
const tp = new TransactionProcessor(VALIDATOR_URL);
tp.addHandler(new LogHandler());
tp.start();

console.log(`Log Transaction Processor started at ${VALIDATOR_URL}`); 