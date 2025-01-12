const { TransactionHandler } = require('sawtooth-sdk/processor/handler');
const { InvalidTransaction } = require('sawtooth-sdk/processor/exceptions');
const { createHash } = require('crypto');

const LOG_FAMILY = 'log';
const LOG_VERSION = '1.0';
const LOG_NAMESPACE = createHash('sha512').update(LOG_FAMILY).digest('hex').substring(0, 6);

class LogHandler extends TransactionHandler {
  constructor() {
    super(LOG_FAMILY, [LOG_VERSION], [LOG_NAMESPACE]);
  }

  async apply(transaction, context) {
    const payload = JSON.parse(transaction.payload.toString());
    const state = new LogState(context);

    switch (payload.action) {
      case 'create':
        await state.createLog(payload.data);
        break;
      default:
        throw new InvalidTransaction(`Unknown action: ${payload.action}`);
    }
  }
}

class LogState {
  constructor(context) {
    this.context = context;
  }

  async createLog(logData) {
    const address = makeAddress(logData._id);
    await this.context.setState({
      [address]: Buffer.from(JSON.stringify(logData))
    });
  }
}

function makeAddress(logId) {
  return LOG_NAMESPACE + createHash('sha512')
    .update(logId)
    .digest('hex')
    .slice(0, 64);
}

module.exports = LogHandler; 