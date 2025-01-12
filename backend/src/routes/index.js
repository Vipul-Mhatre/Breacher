const express = require('express');
const router = express.Router();
const authRoutes = require('./auth.routes');
const logRoutes = require('./logs');
const userRoutes = require('./users');
const { protect } = require('../middleware/auth');

// Mount routes
router.use('/auth', authRoutes);
router.use('/logs', protect, logRoutes);
router.use('/users', protect, userRoutes);

// Health check route
router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

module.exports = router; 