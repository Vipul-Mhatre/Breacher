const sanitize = [];

try {
  const mongoSanitize = require('express-mongo-sanitize');
  const xss = require('xss-clean');
  
  sanitize.push(
    mongoSanitize(),
    xss(),
    (req, res, next) => {
      // Custom sanitization logic if needed
      next();
    }
  );
} catch (error) {
  console.warn('Sanitization middleware not available:', error.message);
  // Add a basic middleware if security modules are not available
  sanitize.push((req, res, next) => next());
}

module.exports = sanitize; 