const express = require('express');
const router = express.Router();
const authRoutes = require('./auth');
const logRoutes = require('./logs');
const userRoutes = require('./users');

// Define routes
router.use('/auth', authRoutes);
router.use('/logs', logRoutes);
router.use('/users', userRoutes);

module.exports = router; 