const rateLimit = require('express-rate-limit');

const createRateLimiter = (options) => {
  return rateLimit({
    windowMs: options.windowMs || 15 * 60 * 1000, // Default: 15 minutes
    max: options.max || 100, // Default: 100 requests per windowMs
    message: options.message || 'Too many requests, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        success: false,
        error: options.message || 'Too many requests, please try again later'
      });
    }
  });
};

module.exports = createRateLimiter; 