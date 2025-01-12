const mongoose = require('mongoose');

const LogSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['access', 'error', 'security', 'system', 'audit']
  },
  severity: {
    type: String,
    required: true,
    enum: ['low', 'medium', 'high']
  },
  message: {
    type: String,
    required: true
  },
  source: {
    type: String,
    required: true
  },
  method: {
    type: String,
    required: false
  },
  path: {
    type: String,
    required: false
  },
  statusCode: {
    type: Number,
    required: false
  },
  responseTime: {
    type: Number,
    required: false
  },
  ip: String,
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  location: {
    type: Object,
    required: false
  },
  headers: {
    type: Object,
    required: false
  },
  body: {
    type: Object,
    required: false
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  },
  isAnomaly: {
    type: Boolean,
    default: false
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Add indexes
LogSchema.index({ timestamp: -1 });
LogSchema.index({ type: 1, severity: 1 });
LogSchema.index({ isAnomaly: 1 });

module.exports = LogSchema; 