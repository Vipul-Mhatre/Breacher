const geoip = require('geoip-lite');
const config = require('../config/config');
const { Log } = require('../models');

const ipFilter = async (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  const geo = geoip.lookup(ip);

  // Log the IP access attempt
  const logData = {
    ip,
    geoLocation: geo,
    timestamp: new Date(),
    path: req.path,
    method: req.method,
    userAgent: req.headers['user-agent']
  };

  try {
    // Check if IP is in blacklist
    const isBlacklisted = await checkIpBlacklist(ip);
    if (isBlacklisted) {
      await Log.create({
        ...logData,
        type: 'security',
        severity: 'high',
        message: 'Access attempt from blacklisted IP',
        status: 'blocked',
        source: 'ipFilter'
      });

      return res.status(403).json({
        success: false,
        error: 'Access denied from this IP address'
      });
    }

    // Check country restrictions
    if (geo && config.security?.allowedCountries?.length && 
        !config.security.allowedCountries.includes(geo.country)) {
      await Log.create({
        ...logData,
        type: 'security',
        severity: 'medium',
        message: 'Access attempt from restricted country',
        status: 'blocked',
        source: 'ipFilter'
      });

      return res.status(403).json({
        success: false,
        error: 'Access denied from your country'
      });
    }

    // Log successful access
    await Log.create({
      ...logData,
      type: 'access',
      severity: 'low',
      message: 'Successful access',
      status: 'allowed',
      source: 'ipFilter'
    });

    next();
  } catch (error) {
    console.error('IP Filter Error:', error);
    next(error);
  }
};

async function checkIpBlacklist(ip) {
  // Check dynamic blacklist in database
  const blacklistedIp = await Log.findOne({
    ip,
    type: 'security',
    severity: 'high',
    timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
  });

  return !!blacklistedIp;
}

module.exports = ipFilter; 