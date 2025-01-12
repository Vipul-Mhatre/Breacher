const rateLimit = require('express-rate-limit');
const { Log } = require('../models');

const createBruteForceProtection = (options = {}) => {
  return rateLimit({
    windowMs: options.windowMs || 15 * 60 * 1000, // 15 minutes
    max: options.max || 5, // 5 attempts
    skipSuccessfulRequests: true,
    handler: async (req, res) => {
      // Log the brute force attempt
      await Log.create({
        type: 'security',
        severity: 'high',
        message: 'Brute force attempt detected',
        source: 'bruteForce',
        ip: req.ip,
        method: req.method,
        path: req.path,
        headers: {
          userAgent: req.headers['user-agent']
        }
      });

      res.status(429).json({
        success: false,
        error: 'Too many failed attempts. Please try again later.'
      });
    }
  });
};

module.exports = createBruteForceProtection; 