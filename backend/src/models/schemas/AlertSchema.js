const mongoose = require('mongoose');

const AlertSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['anomaly', 'security', 'system']
  },
  message: {
    type: String,
    required: true
  },
  severity: {
    type: String,
    required: true,
    enum: ['low', 'medium', 'high']
  },
  logId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Log'
  },
  status: {
    type: String,
    enum: ['new', 'investigating', 'resolved'],
    default: 'new'
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = AlertSchema; 