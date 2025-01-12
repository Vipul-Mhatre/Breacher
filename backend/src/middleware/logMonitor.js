const geoip = require('geoip-lite');
const { Log } = require('../models');
const { detectAnomaly } = require('../services/anomalyDetection');
const { addToBlockchain } = require('../services/blockchain');

const logMonitor = async (req, res, next) => {
  const startTime = Date.now();
  
  // Wait for the request to finish
  res.on('finish', async () => {
    const ip = req.ip || req.connection.remoteAddress;
    const geo = geoip.lookup(ip);
    
    const logData = {
      type: 'access',
      severity: 'low',
      message: `${req.method} ${req.path}`,
      source: 'logMonitor',
      userId: req.user?.id,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      responseTime: Date.now() - startTime,
      ip: ip,
      location: geo,
      timestamp: new Date(),
      headers: req.headers,
      body: req.body
    };

    try {
      // Save to MongoDB
      const log = await Log.create(logData);

      // Check for anomalies
      const isAnomaly = await detectAnomaly(logData);
      
      if (isAnomaly) {
        // Update log with anomaly flag
        log.isAnomaly = true;
        await log.save();

        // Add to blockchain if anomaly detected
        await addToBlockchain(logData);
        
        // Emit alert through Socket.IO
        req.app.get('io').emit('anomaly-detected', {
          type: 'anomaly',
          data: logData
        });
      }
    } catch (error) {
      console.error('Error in log monitoring:', error);
    }
  });

  next();
};

module.exports = logMonitor; 