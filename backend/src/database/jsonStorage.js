const fs = require('fs').promises;
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');
const FILES = {
  logs: path.join(DATA_DIR, 'logs.json'),
  users: path.join(DATA_DIR, 'users.json'),
  alerts: path.join(DATA_DIR, 'alerts.json')
};

// Initialize storage
async function initStorage() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    
    // Initialize files if they don't exist
    for (const file of Object.values(FILES)) {
      try {
        await fs.access(file);
      } catch {
        await fs.writeFile(file, JSON.stringify([]));
      }
    }
  } catch (error) {
    console.error('Error initializing storage:', error);
    throw error;
  }
}

// Generic CRUD operations
async function readData(file) {
  const data = await fs.readFile(file, 'utf8');
  return JSON.parse(data);
}

async function writeData(file, data) {
  await fs.writeFile(file, JSON.stringify(data, null, 2));
}

// Database operations
const db = {
  logs: {
    async find(query = {}, options = {}) {
      const logs = await readData(FILES.logs);
      return logs.filter(log => matchQuery(log, query));
    },
    async findOne(query = {}) {
      const logs = await readData(FILES.logs);
      return logs.find(log => matchQuery(log, query));
    },
    async create(data) {
      const logs = await readData(FILES.logs);
      const newLog = { _id: generateId(), ...data, timestamp: new Date() };
      logs.push(newLog);
      await writeData(FILES.logs, logs);
      return newLog;
    }
  },
  users: {
    async findOne(query = {}) {
      const users = await readData(FILES.users);
      return users.find(user => matchQuery(user, query));
    },
    async create(data) {
      const users = await readData(FILES.users);
      const newUser = { _id: generateId(), ...data };
      users.push(newUser);
      await writeData(FILES.users, users);
      return newUser;
    }
  }
};

// Helper functions
function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

function matchQuery(item, query) {
  return Object.entries(query).every(([key, value]) => {
    if (key === '_id') return item[key] === value;
    if (typeof value === 'object') {
      return Object.entries(value).every(([operator, operand]) => {
        switch (operator) {
          case '$gte': return item[key] >= operand;
          case '$lte': return item[key] <= operand;
          default: return true;
        }
      });
    }
    return item[key] === value;
  });
}

module.exports = {
  initStorage,
  db
}; 