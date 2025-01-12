const express = require('express');
const router = express.Router();
const authRoutes = require('./authRoutes');
const logRoutes = require('./logRoutes');

// Mount routes
router.use('/auth', authRoutes);
router.use('/logs', logRoutes);

module.exports = router; 