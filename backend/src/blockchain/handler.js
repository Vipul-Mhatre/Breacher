const { TransactionHandler } = require('sawtooth-sdk/processor/handler');
const { InvalidTransaction } = require('sawtooth-sdk/processor/exceptions');
const crypto = require('crypto');

const FAMILY_NAME = 'log';
const FAMILY_VERSION = '1.0';
const NAMESPACE = hash(FAMILY_NAME).substring(0, 6);

function hash(data) {
  return crypto.createHash('sha512').update(data).digest('hex');
}

class LogHandler extends TransactionHandler {
  constructor() {
    super(FAMILY_NAME, [FAMILY_VERSION], [NAMESPACE]);
  }

  async apply(transactionProcessRequest, context) {
    const payload = JSON.parse(transactionProcessRequest.payload.toString());
    const { action, data } = payload;

    switch (action) {
      case 'log':
        await this.logEvent(context, data);
        break;
      default:
        throw new InvalidTransaction(`Unknown action: ${action}`);
    }
  }

  async logEvent(context, data) {
    const address = NAMESPACE + hash(data.id).slice(-64);
    const eventData = Buffer.from(JSON.stringify(data));
    await context.setState({ [address]: eventData });
  }
}

module.exports = LogHandler; 