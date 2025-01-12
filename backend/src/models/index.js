const { db } = require('../database/jsonStorage');

// Replace mongoose models with JSON storage
const models = {
  Log: db.logs,
  User: db.users,
  Alert: db.logs // We'll use the same storage for logs and alerts
};

module.exports = models; 