const LogService = require('../services/LogService');
const { io } = require('../config/socket');

exports.createLog = async (req, res) => {
  try {
    const log = await LogService.createLog(req.body);
    
    if (log.isAnomaly) {
      io.emit('new-alert', {
        type: 'anomaly',
        message: `Anomaly detected: ${log.message}`,
        severity: log.severity,
        timestamp: log.timestamp
      });
    }

    res.status(201).json({
      status: 'success',
      data: log
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

exports.getLogs = async (req, res) => {
  try {
    const { page = 1, limit = 10, type, severity, startDate, endDate } = req.query;
    
    const query = {};
    if (type) query.type = type;
    if (severity) query.severity = severity;
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    const logs = await LogService.getLogs(query, page, limit);
    
    res.json({
      status: 'success',
      data: logs
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

exports.getAnomalies = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const anomalies = await LogService.getAnomalies(page, limit);
    
    res.json({
      status: 'success',
      data: anomalies
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
}; 